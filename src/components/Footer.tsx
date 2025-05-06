// Minimal Footer component
export default function Footer() {
  return (
    <footer className="w-full border-t p-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} AI Agents Edu. All rights reserved.
    </footer>
  );
}
