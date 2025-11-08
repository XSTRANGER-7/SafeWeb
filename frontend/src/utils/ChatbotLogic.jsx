// utils/chatbotLogic.js
export const chatbotLogic = (input) => {
    input = input.toLowerCase();
    if (input.includes("fraud") || input.includes("complaint")) {
      return "Please go to 'File Complaint' or I can help you fill it. Would you like me to start?";
    }
    if (input.includes("status")) {
      return "Enter your complaint ID to track status. You can also view it in your dashboard.";
    }
    if (input.includes("help")) {
      return "I can assist you in filing a complaint, tracking refund, or connecting to police helpline.";
    }
    return "I'm sorry, could you please rephrase?";
  };
  