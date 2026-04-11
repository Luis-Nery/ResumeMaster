package com.luisnery.resumemaster.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;

/**
 * REST controller for PDF generation.
 * Accepts rendered HTML from the frontend and produces a PDF via a Node.js/Puppeteer subprocess.
 * All endpoints require a valid JWT token in the {@code Authorization} header.
 */
@Slf4j
@Tag(name = "PDF", description = "Generate a PDF from rendered resume HTML")
@RestController
@RequestMapping("/api/pdf")
public class PdfController {

    /**
     * Generates a PDF from an HTML string by invoking the {@code generate-pdf.js} Puppeteer script.
     * The HTML is Base64-encoded before being passed to the subprocess via {@code ProcessBuilder}.
     *
     * @param body a map containing a single key {@code "html"} with the full HTML content to render
     * @return the raw PDF bytes as {@code application/pdf}, or 500 if the subprocess fails
     */
    @Operation(summary = "Generate a PDF",
               description = "Accepts HTML content and returns a PDF rendered by Puppeteer (Node.js). The HTML is the active resume template rendered by the frontend.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "PDF generated successfully"),
        @ApiResponse(responseCode = "500", description = "PDF generation failed")
    })
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

            log.info("PDF subprocess exit code: {}, output size: {} bytes, working dir: {}",
                    exitCode, output.length, System.getProperty("user.dir"));

            if (exitCode != 0) {
                log.error("PDF generation failed (exit code {}): {}", exitCode, new String(output));
                return ResponseEntity.internalServerError().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "resume.pdf");

            return ResponseEntity.ok().headers(headers).body(output);
        } catch (Exception e) {
            log.error("Unexpected error during PDF generation", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}