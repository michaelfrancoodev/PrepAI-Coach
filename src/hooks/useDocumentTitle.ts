import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title.includes('PrepAI') ? title : `${title} — PrepAI`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
