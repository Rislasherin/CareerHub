import axios from "axios";
import { env } from "../../src/infrastructure/config/env.validator";

async function run() {
  const baseURL = `http://127.0.0.1:${env.PORT}/api`;
  console.log(`Testing API at: ${baseURL}`);

  try {
    // 1. Login
    console.log("Logging in...");
    const loginRes = await axios.post(`${baseURL}/auth/super-admin/login`, {
      email: "admin@careerhub.com",
      password: "AdminPassword123"
    });

    const token = loginRes.data.data.accessToken || loginRes.data.data.token;
    console.log("Login successful! Token:", token ? `${token.substring(0, 10)}...` : "None");

    // 2. Fetch profile
    console.log("Fetching profile...");
    const profileRes = await axios.get(`${baseURL}/super-admin/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Profile fetched:", profileRes.data);

    // 3. Update profile
    console.log("Updating profile...");
    const updateRes = await axios.patch(`${baseURL}/super-admin/profile`, {
      firstName: "System Updated",
      lastName: "Admin"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Update response:", updateRes.data);
  } catch (error: any) {
    if (error.response) {
      console.error("API Error Status:", error.response.status);
      console.error("API Error Body:", error.response.data);
    } else {
      console.error("Request failed with error:", error.message);
    }
  }
}

run();
