
import { useState, useEffect } from "react";

interface TypedTextProps {
  words: string[];
}

const TypedText = ({ words }: TypedTextProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState("");

  // Colors array matching the words array
  const colors = ['#33C3F0', '#34D399', '#A78BFA'];

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
        minWidth: `${maxLength + 1}ch`,
        fontFamily: 'Pacifico, cursive',
        fontSize: '1.1em',
        letterSpacing: '0.05em',
        paddingRight: '0.25em',
        color: colors[currentWordIndex]
      }}
    >
      {text}
      <span className="inline-block animate-pulse ml-1">|</span>
    </span>
  );
};

export default TypedText;

