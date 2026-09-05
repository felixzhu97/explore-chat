export function ThemeInitScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){var t=localStorage.getItem('whatschat_admin_theme');var m=t==='dark'?'dark':'light';document.documentElement.setAttribute('data-theme',m);document.documentElement.setAttribute('data-bs-theme',m);})();`,
      }}
    />
  );
}
