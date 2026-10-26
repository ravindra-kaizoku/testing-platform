package com.mock;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

public class CalculatorTest {

    private Calculator calculator;

    @BeforeEach
    public void setUp() {
        calculator = new Calculator();
    }

    @Test
    public void testAddNormal() {
        assertEquals(5, calculator.add(2, 3), "2 + 3 should equal 5");
    }

    @Test
    public void testDivideNormal() {
        assertEquals(2, calculator.divide(6, 3), "6 / 3 should equal 2");
    }

    @Test
    public void testDivideByZeroNegative() {
        assertThrows(ArithmeticException.class, () -> {
            calculator.divide(5, 0);
        }, "Dividing by zero should throw ArithmeticException");
    }

    @Test
    public void testBoundaryValues() {
        // Verify behavior around boundary values
        assertEquals(0, calculator.add(Integer.MAX_VALUE, Integer.MIN_VALUE + 1));
    }
}
