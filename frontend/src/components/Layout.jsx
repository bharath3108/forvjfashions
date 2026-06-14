import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ChatWidget from './ChatWidget.jsx';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
