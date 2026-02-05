using AIResumeGenerator.API.Services;
using FluentAssertions;
using Xunit;

namespace AIResumeGenerator.API.Tests.Services;

public class PhoneNumberFormatterTests
{
    private readonly PhoneNumberFormatter _formatter;

    public PhoneNumberFormatterTests()
    {
        _formatter = new PhoneNumberFormatter();
    }

    [Theory]
    [InlineData("12345678", "DK", "12 34 56 78")]
    [InlineData("87654321", "DK", "87 65 43 21")]
    [InlineData("+4512345678", "DK", "+45 12 34 56 78")]
    public void FormatPhoneNumber_DanishNumbers_FormatsCorrectly(string input, string countryCode, string expected)
    {
        // Act
        var result = _formatter.FormatPhoneNumber(input, countryCode);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("5551234567", "US", "(555) 123-4567")]
    [InlineData("+15551234567", "US", "+1 555-123-4567")]
    public void FormatPhoneNumber_USNumbers_FormatsCorrectly(string input, string countryCode, string expected)
    {
        // Act
        var result = _formatter.FormatPhoneNumber(input, countryCode);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public void FormatPhoneNumber_InvalidNumber_ReturnsOriginal()
    {
        // Arrange
        var invalidNumber = "not-a-phone-number";

        // Act
        var result = _formatter.FormatPhoneNumber(invalidNumber, "DK");

        // Assert
        result.Should().Be(invalidNumber);
    }

    [Fact]
    public void FormatPhoneNumber_EmptyString_ReturnsEmpty()
    {
        // Act
        var result = _formatter.FormatPhoneNumber("", "DK");

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public void FormatPhoneNumber_InternationalNumber_FormatsWithInternationalPrefix()
    {
        // Arrange
        var danishNumberFromUS = "+4512345678";

        // Act
        var result = _formatter.FormatPhoneNumber(danishNumberFromUS, "US");

        // Assert
        result.Should().StartWith("+45");
    }
}
