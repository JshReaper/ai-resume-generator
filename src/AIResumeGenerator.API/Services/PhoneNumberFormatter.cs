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

            // Format based on country
            if (_phoneUtil.IsValidNumber(number))
            {
                // Format internationally if it's not from the default country
                if (_phoneUtil.GetRegionCodeForNumber(number) != countryCode)
                {
                    return _phoneUtil.Format(number, PhoneNumberFormat.INTERNATIONAL);
                }

                // Format nationally for local numbers
                return _phoneUtil.Format(number, PhoneNumberFormat.NATIONAL);
            }

            return phoneNumber; // Return original if invalid
        }
        catch
        {
            // If parsing fails, return original
            return phoneNumber;
        }
    }
}
