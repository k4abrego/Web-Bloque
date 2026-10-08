function ConfiguracionAlim() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        padding: "32px",
        boxSizing: "border-box",
        backgroundColor: "#f5f5f5",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "32px",
          fontWeight: "700",
          color: "#333",
        }}
      >
        Configuración
      </h1>

      <p
        style={{
          marginTop: "10px",
          color: "#777",
          fontSize: "16px",
        }}
      >
        Configuración de la cuenta y del sistema.
      </p>

      {/* espacio reservado para conectar con el backend*/}

      <div
        style={{
          marginTop: "30px",
          width: "100%",
          minHeight: "500px",
          backgroundColor: "#e5e5e5",
          borderRadius: "16px",
        }}
      />
    </div>
  );
}

export default ConfiguracionAlim;