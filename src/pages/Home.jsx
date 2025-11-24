import { useState, useEffect } from "react";
import Contact from "./Contact";
import HeroSection from "./HeroSection";
import About from "./About";
import Services from "./Services";
import Testimonials from "./Testimonials";
import { useNavigate, useLocation } from "react-router-dom";
import Team from "./Team";

function Home({ onOpenContact }) {
  const [activeNav, setActiveNav] = useState("Home");
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  // Handle route-based section navigation
  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath === "/") {
      // On home page, no specific section
      setActiveNav("Home");
    } else {
      // Map route to section
      const routeToSection = {
        "/services": "Services",
        "/about": "About",
        "/testimonials": "Testimonials",
        "/contact": "Contact",
      };

      const section = routeToSection[currentPath];
      if (section) {
        setActiveNav(section);
        // Scroll to section after a brief delay
        setTimeout(() => {
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="bg-white">
      <main>
        <section id="Home">
          <HeroSection setActiveNav={setActiveNav} />
        </section>
        <section id="Services">
          <Services />
        </section>
        <section id="About">
          <About />
        </section>
        <section id="Team">
          <Team />
        </section>
        {/*<section id="Testimonials">
          <Testimonials />
        </section>*/}
        <section id="Contact">
          <Contact onOpenContact={onOpenContact} />
        </section>
      </main>
    </div>
  );
}

export default Home;
