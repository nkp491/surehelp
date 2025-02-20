
import { useState, useEffect } from "react";

interface TypedTextProps {
  words: string[];
}

const TypedText = ({ words }: TypedTextProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState("");

  // Find the longest word to set the minimum width
  const maxLength = Math.max(...words.map(word => word.length));

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    setText(currentWord.substring(0, charIndex));

    let speed = isDeleting ? 100 : 150; // Typing & deleting speed

    if (!isDeleting && charIndex === currentWord.length) {
      setTimeout(() => setIsDeleting(true), 2000); // Pause at full word
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }

    const timer = setTimeout(() => {
      setCharIndex((prev) => (isDeleting ? prev - 1 : prev + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, words, currentWordIndex]);

  return (
    <span 
      className="relative inline-block text-left font-normal" 
      style={{ 
        minWidth: `${maxLength}ch`,
        fontFamily: 'Pacifico, cursive',
        fontSize: '1.1em',
        color: '#34D399'
      }}
    >
      {text}
      <span className="inline-block animate-pulse">|</span>
    </span>
  );
};

export default TypedText;
