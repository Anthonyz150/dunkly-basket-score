const wrapper = {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(circle at center, #0f172a, #000)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  
  const card = {
    background: "#020617",
    padding: "48px",
    width: "380px",
    borderRadius: "24px",
    boxShadow: "0 40px 80px rgba(0,0,0,0.9)",
    textAlign: "center",
  };
  
  const logo = {
    background: "#f97316",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 12px",
    fontSize: "26px",
  };
  
  const title = {
    color: "#fff",
    fontSize: "2.5rem",
    fontWeight: 900,
    marginBottom: "20px",
  };
  
  const tabs = {
    display: "flex",
    gap: "10px",
    marginBottom: "25px",
  };
  
  const tab = {
    flex: 1,
    padding: "10px",
    background: "transparent",
    border: "1px solid #1e293b",
    color: "#94a3b8",
    borderRadius: "10px",
    cursor: "pointer",
  };
  
  const tabActive = {
    ...tab,
    background: "#f97316",
    color: "#fff",
    border: "none",
  };
  
  const form = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };
  
  const input = {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #1e293b",
    background: "#020617",
    color: "#fff",
    outline: "none",
  };
  
  const button = {
    marginTop: "10px",
    padding: "14px",
    borderRadius: "14px",
    background: "#f97316",
    border: "none",
    fontWeight: 900,
    cursor: "pointer",
  };
  
  const eye = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
  };
  
  const errorStyle = {
    color: "#ff5555",
    fontSize: "13px",
    marginBottom: "10px",
  };
  
  const footer = {
    marginTop: "20px",
    color: "#94a3b8",
  };
  
  const link = {
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  };  