import { Code2, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-8 mt-12 border-t border-border/30">
      <div className="container mx-auto px-4 text-center">
        <a 
          href="https://peso-site.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
        >
          <Code2 className="w-4 h-4" />
          <span className="font-english">Developed by</span>
          <span className="font-bold text-primary group-hover:text-primary/80 font-english">PESO</span>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </footer>
  );
};