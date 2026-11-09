
import { Link } from "react-router-dom";

function Home() {
  return (
    <main>
      <nav>
        <h2>HireFlow</h2>

        <div>
          <Link to="/login">Login</Link>
          <Link to="/register">Get Started</Link>
        </div>
      </nav>

      <section className="hero">
        <p className="tagline">RECRUITMENT MADE SIMPLE</p>

        <h1>
          Find the right people.
          <br />
          Build the right future.
        </h1>

        <p className="description">
          HireFlow connects talented candidates with great opportunities
          and helps recruiters manage hiring from one place.
        </p>

        <div className="hero-buttons">
          <Link to="/register" className="primary-btn">
            Get Started
          </Link>

          <Link to="/login" className="secondary-btn">
            Sign In
          </Link>
        </div>
      </section>

      <section className="features">
        <h2>Everything you need to hire better</h2>

        <div className="feature-grid">
          <article>
            <h3>Find Opportunities</h3>
            <p>Discover jobs that match your skills and career goals.</p>
          </article>

          <article>
            <h3>Manage Applications</h3>
            <p>Track applications and stay updated on their progress.</p>
          </article>

          <article>
            <h3>Organize Interviews</h3>
            <p>Schedule and manage interviews in one convenient place.</p>
          </article>
        </div>
      </section>

      <footer>
        © 2026 HireFlow. All rights reserved.
      </footer>
    </main>
  );
}
export default Home;