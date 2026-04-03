import { Leaf, Github, Linkedin } from "lucide-react";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const isCustomerRoute = location.pathname.startsWith("/customer");

  return (
  <footer
    className={isCustomerRoute ? "text-[var(--customer-footer-text)] border-t" : "bg-surface text-foreground border-t border-border/80"}
    style={isCustomerRoute
      ? { backgroundColor: "var(--customer-footer-bg)", borderColor: "var(--border-default)" }
      : undefined}
  >
    <div className="container py-2 sm:py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center sm:justify-start gap-2 font-display font-bold text-sm sm:text-base">
          <Leaf className="h-4 w-4" />
          AgriConnect
        </div>

        <p className={`text-[11px] sm:text-sm text-center sm:text-left leading-relaxed ${isCustomerRoute ? "text-[var(--customer-footer-muted)]" : "text-muted-foreground"}`}>
          © 2026 Built by{" "}
          <a
            href="https://abhijitreddy-portfolio.netlify.app/"
            target="_blank"
            rel="noreferrer"
            className={isCustomerRoute
              ? "font-semibold text-[var(--customer-footer-text)] hover:text-[var(--primary-500)] underline-offset-2 hover:underline"
              : "font-semibold text-foreground hover:text-primary underline-offset-2 hover:underline"
            }
          >
            Abhijit Reddy
          </a>
          .
        </p>

        <div className="flex items-center justify-center gap-1">
          <a
            href="https://www.linkedin.com/in/abhijitreddy75"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className={`${isCustomerRoute
              ? "text-[var(--customer-footer-muted)] hover:text-[var(--primary-500)]"
              : "text-muted-foreground hover:text-foreground"
            } h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full transition-colors`}
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/abhijitreddy-06"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={`${isCustomerRoute
              ? "text-[var(--customer-footer-muted)] hover:text-[var(--primary-500)]"
              : "text-muted-foreground hover:text-foreground"
            } h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full transition-colors`}
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
