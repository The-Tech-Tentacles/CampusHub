import { Heart, Code, Users, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border/40 mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* CampusHub Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg">CampusHub</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your ultimate university companion. Streamlining campus life with
              modern design and seamless functionality.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Quick Links</h4>
            <div className="space-y-2">
              <a
                href="/dashboard"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/notices"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Notices
              </a>
              <a
                href="/schedule"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Calendar
              </a>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Connect</h4>
            <div className="flex gap-3">
              <a
                href="https://github.com/The-Tech-Tentacles"
                className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/in/rakeshyadav"
                className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:rakeshyadavry087@gmail.com"
                className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Credit Section */}
      <div className="border-t border-border/30 bg-muted/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © {currentYear} CampusHub. All rights reserved.
            </div>

            {/* Creator Credit */}
            <div className="flex flex-col items-center sm:items-end gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Crafted with</span>
                <Heart className="h-4 w-4 text-red-500 fill-current" />
                <span className="text-muted-foreground">by</span>
                <span className="font-semibold text-foreground">
                  <a
                    href="https://github.com/Rakeshyadav-19"
                    className="text-blue-400"
                  >
                    Rakesh Yadav{" "}
                  </a>
                  & Team
                </span>
              </div>

              {/* Team Credit */}
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <span className="font-bold text-primary text-sm">
                  <a
                    href="https://github.com/The-Tech-Tentacles"
                    className="text-blue-400"
                  >
                    The Tech Tentacles
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
