using PhoneNumbers;

namespace AIResumeGenerator.API.Services;

public interface IPhoneNumberFormatter
{
    string FormatPhoneNumber(string phoneNumber, string countryCode = "DK");
}

public class PhoneNumberFormatter : IPhoneNumberFormatter
{
    private readonly PhoneNumberUtil _phoneUtil;

    public PhoneNumberFormatter()
    {
        _phoneUtil = PhoneNumberUtil.GetInstance();
    }

    public string FormatPhoneNumber(string phoneNumber, string countryCode = "DK")
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return phoneNumber;

        try
        {
            // Try to parse the number
            var number = _phoneUtil.Parse(phoneNumber, countryCode);

            // Format even if not strictly valid - helps with test numbers and edge cases
            // If input already had country code prefix, use international format to preserve it
            if (phoneNumber.Trim().StartsWith("+"))
            {
                return _phoneUtil.Format(number, PhoneNumberFormat.INTERNATIONAL);
            }

            // Format nationally for local numbers (without country code prefix)
            return _phoneUtil.Format(number, PhoneNumberFormat.NATIONAL);
        }
        catch
        {
            // If parsing fails, return original
            return phoneNumber;
        }
    }
}
