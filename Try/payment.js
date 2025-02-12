document.addEventListener("DOMContentLoaded", function () {
  // Get all elements
  const paymentTabs = document.querySelectorAll(".payment-method-tab");
  const cardForm = document.getElementById("card-payment-form");
  const upiForm = document.getElementById("upi-payment-form");

  // Card form submission
  cardForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const cardName = document.getElementById("cardholder-name").value.trim();
    const cardNumber = document
      .getElementById("card-number")
      .value.replace(/\s+/g, "");
    const expiryDate = document.getElementById("expiry-date").value.trim();
    const cvv = document.getElementById("cvv").value.trim();

    // Validation
    if (!cardName || !cardNumber || !expiryDate || !cvv) {
      showToast("Please fill in all fields correctly.", "error");
      return;
    }

    if (!/^\d{16}$/.test(cardNumber)) {
      showToast("Invalid card number. Must be 16 digits.", "error");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      showToast("Invalid expiry date format. Use MM/YY.", "error");
      return;
    }

    if (!/^\d{3}$/.test(cvv)) {
      showToast("Invalid CVV. Must be 3 digits.", "error");
      return;
    }

    processPayment("card");
  });

  // UPI payment handling
  const upiOptions = document.querySelectorAll(".upi-option");
  let selectedUpiApp = null;

  upiOptions.forEach((option) => {
    option.addEventListener("click", function () {
      upiOptions.forEach((opt) => opt.classList.remove("selected"));
      this.classList.add("selected");
      selectedUpiApp = this.querySelector("span").textContent;
    });
  });

  // UPI form submission
  document
    .querySelector("#upi-payment-form .pay-btn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      const upiId = document.getElementById("upi-id").value.trim();

      if (!selectedUpiApp && !upiId) {
        showToast("Please select a UPI app or enter UPI ID", "error");
        return;
      }

      processPayment("upi");
    });

  // Tab switching
  paymentTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const method = this.getAttribute("data-method");

      // Update active tab
      paymentTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Show/hide forms
      if (method === "card") {
        cardForm.style.display = "block";
        upiForm.style.display = "none";
      } else {
        cardForm.style.display = "none";
        upiForm.style.display = "block";
      }
    });
  });

  // Helper functions
  function processPayment(method) {
    const button =
      method === "card"
        ? cardForm.querySelector(".pay-btn")
        : upiForm.querySelector(".pay-btn");

    // Show loading state
    button.disabled = true;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Processing...';

    // Simulate payment processing
    setTimeout(() => {
      button.disabled = false;
      button.innerHTML = originalText;
      showToast("Payment Successful!", "success");

      // Redirect after success
      setTimeout(() => {
        window.location.href = "confirmation.html";
      }, 1000);
    }, 2000);
  }

  function showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `${type}-toast`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  // Format card number input
  const cardNumberInput = document.getElementById("card-number");
  cardNumberInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (value.length > 16) value = value.slice(0, 16);
    const parts = value.match(/[\s\S]{1,4}/g) || [];
    this.value = parts.join(" ");
  });

  // Format expiry date input
  const expiryInput = document.getElementById("expiry-date");
  expiryInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    this.value = value;
  });
});
