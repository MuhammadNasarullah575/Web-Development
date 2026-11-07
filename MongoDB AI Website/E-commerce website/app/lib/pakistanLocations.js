export const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Larkana",
  "Abbottabad",
  "Mardan",
  "Gujrat",
  "Sahiwal",
  "Rahim Yar Khan",
  "Okara",
  "Wah Cantt",
  "Dera Ghazi Khan",
  "Kasur",
  "Jhelum",
  "Chiniot",
  "Sheikhupura",
  "Kamoke",
  "Hafizabad",
  "Mingora (Swat)",
  "Mirpur (AJK)",
  "Muzaffarabad (AJK)",
  "Gilgit",
  "Skardu",
  "Other",
];

/**
 * Validates Pakistani Mobile Phone Number
 * Must be 11 digits starting with 03 (e.g. 03001234567, 0300-1234567)
 * or international format (+923001234567, 923001234567)
 */
export function validatePakistaniPhone(phone) {
  if (!phone || typeof phone !== "string") {
    return { isValid: false, message: "Enter mobile number" };
  }

  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");

  // Match 03XXXXXXXXX (11 digits) or +923XXXXXXXXX / 923XXXXXXXXX
  const regex = /^((\+92)|(0092)|(92)|(0))?3[0-9]{9}$/;

  if (!regex.test(cleaned)) {
    return {
      isValid: false,
      message: "Incorrect phone number",
    };
  }

  return { isValid: true, cleaned, formatted: cleaned.startsWith("+92") ? cleaned : `0${cleaned.slice(-10)}` };
}

