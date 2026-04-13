package com.luisnery.resumemaster;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Smoke test that verifies the Spring application context loads without errors.
 * If any bean is misconfigured or a required dependency is missing, this test
 * will fail at startup, catching wiring problems early.
 */
@SpringBootTest
class ResumemasterApplicationTests {

    /**
     * Verifies that the Spring application context starts up successfully with
     * no missing beans or configuration errors.
     */
    @Test
    void contextLoads() {
    }

}
