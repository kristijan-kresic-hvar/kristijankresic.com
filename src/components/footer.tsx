import { Container } from './container';
import { PROFILE } from '@/content/profile';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle py-10 text-sm text-text-muted">
      <Container className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {PROFILE.name} · {PROFILE.location}
        </p>
        <nav aria-label="Footer" className="flex gap-5">
          <a href={PROFILE.github} className="hover:text-text-primary">
            GitHub
          </a>
          <a href={PROFILE.linkedin} className="hover:text-text-primary">
            LinkedIn
          </a>
          <a href={`mailto:${PROFILE.email}`} className="hover:text-text-primary">
            Email
          </a>
        </nav>
      </Container>
    </footer>
  );
}
