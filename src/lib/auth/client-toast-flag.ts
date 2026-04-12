// Helper to set cookie during login process
export function setLoginSuccessToastFlag() {
  document.cookie = "login_toast_pending=1; path=/; max-age=60";
}

// Client-side helper to consume & clear the flag
export function checkAndClearLoginToastFlag(): boolean {
  if (typeof document === "undefined") return false;
  
  if (document.cookie.includes("login_toast_pending=1")) {
    document.cookie = "login_toast_pending=; path=/; max-age=0";
    return true;
  }
  return false;
}