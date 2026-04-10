package com.luisnery.resumemaster.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
public class PdfController {

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generatePdf(@RequestBody Map<String, String> body) {
        try {
            String html = body.get("html");
            String encoded = Base64.getEncoder().encodeToString(html.getBytes());

            ProcessBuilder pb = new ProcessBuilder(
                    "node",
                    "generate-pdf.js",
                    encoded
            );
            pb.directory(new java.io.File(System.getProperty("user.dir")));
            pb.redirectErrorStream(true);
            Process process = pb.start();

            byte[] output = process.getInputStream().readAllBytes();
            int exitCode = process.waitFor();

            System.out.println("Exit code: " + exitCode);
            System.out.println("Output size: " + output.length);
            System.out.println("Working dir: " + System.getProperty("user.dir"));

            if (exitCode != 0) {
                System.out.println("Error output: " + new String(output));
                return ResponseEntity.internalServerError().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "resume.pdf");

            return ResponseEntity.ok().headers(headers).body(output);
        } catch (Exception e) {
            System.out.println("Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}