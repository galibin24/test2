import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

// The next js way to implement global styles.
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
