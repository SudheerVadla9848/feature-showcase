import FeatureShowcase from "./FeatureShowcase";

export default function App() {
  return (
    <>
      {/* Buffer before so user can scroll into the sticky section */}
      <div style={{ height: "90vh" }} />
      <FeatureShowcase />
      {/* Buffer after so the page continues normally once released */}
      <div style={{ height: "120vh" }} />
    </>
  );
}
