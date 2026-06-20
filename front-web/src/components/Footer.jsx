export default function Footer() {
  return (
    <footer className="py-8 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900 night:bg-black text-center text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-semibold text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Yohanes Debebe. All rights reserved.
        </div>
        <div className="flex gap-4">
          <a href="https://github.com/yopeman" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-white transition-colors">GitHub</a>
          <a href="https://www.linkedin.com/in/yohanes-debebe-71a93136b" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-white transition-colors">LinkedIn</a>
          <a href="https://t.me/yope_man" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-white transition-colors">Telegram</a>
        </div>
      </div>
    </footer>
  );
}