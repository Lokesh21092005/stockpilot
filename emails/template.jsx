import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function EmailTemplate({ type = "low-stock", userName = "", data = {} }) {
  if (type === "low-stock") {
    return (
      <Html>
        <Head />
        <Preview>Low-stock alert from StockPilot</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Low-stock alert</Heading>
            <Text style={styles.text}>Hi {userName || "there"},</Text>
            <Text style={styles.text}>
              {data.productName} ({data.sku}) is at {data.stockQuantity} units, below the minimum of {data.minimumStock}.
            </Text>
            <Section style={styles.card}>
              <Text style={styles.text}>Suggested reorder quantity</Text>
              <Text style={styles.big}>{data.reorderAmount}</Text>
            </Section>
            <Text style={styles.footer}>StockPilot — inventory operations made easier.</Text>
          </Container>
        </Body>
      </Html>
    );
  }

  if (type === "monthly-report") {
  return (
    <Html>
      <Head />
      <Preview>Monthly inventory report from StockPilot</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.title}>
            Monthly Inventory Report
          </Heading>

          <Text style={styles.text}>
            Hi {userName || "there"}, here is your latest
            StockPilot inventory analysis.
          </Text>

          <Section style={styles.card}>
            <Text style={styles.text}>
              Inventory value
            </Text>

            <Text style={styles.big}>
              ₹
              {Number(
                data.endingInventoryValue || 0
              ).toFixed(0)}
            </Text>

            <Text style={styles.text}>
              Units received: {data.totalReceived}
            </Text>

            <Text style={styles.text}>
              Units issued: {data.totalIssued}
            </Text>

            <Text style={styles.text}>
              Low-stock SKUs: {data.lowStockCount}
            </Text>
          </Section>

          <Heading style={{ ...styles.title, fontSize: "20px" }}>
            AI Summary
          </Heading>

          <Text style={styles.text}>
            {data.aiSummary}
          </Text>

          <Heading style={{ ...styles.title, fontSize: "18px" }}>
            Recommendations
          </Heading>

          {Array.isArray(data.aiRecommendations) &&
            data.aiRecommendations.map((item, index) => (
              <Text key={index} style={styles.text}>
                • {item}
              </Text>
            ))}

          <Text style={styles.footer}>
            StockPilot — inventory operations made easier.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

  return (
    <Html>
      <Head />
      <Preview>Weekly inventory digest</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.title}>Weekly inventory digest</Heading>
          <Text style={styles.text}>Hi {userName || "there"}, here is your operations snapshot.</Text>
          <Section style={styles.card}>
            <Text style={styles.text}>Inventory value</Text>
            <Text style={styles.big}>₹{Number(data.inventoryValue || 0).toFixed(0)}</Text>
            <Text style={styles.text}>Low-stock SKUs: {data.lowStockCount || 0}</Text>
          </Section>
          <Text style={styles.footer}>Review the dashboard for detailed movement and reorder context.</Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: { backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" },
  container: { backgroundColor: "#fff", margin: "40px auto", padding: "28px", borderRadius: "12px" },
  title: { color: "#0f172a", fontSize: "28px", marginBottom: "18px" },
  text: { color: "#475569", fontSize: "15px", lineHeight: 1.6 },
  big: { color: "#0f172a", fontSize: "30px", fontWeight: "bold" },
  card: { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "18px", margin: "22px 0" },
  footer: { color: "#94a3b8", fontSize: "12px", marginTop: "30px" },
};
