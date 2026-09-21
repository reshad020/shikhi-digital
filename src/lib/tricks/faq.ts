import type { Technique } from "./techniques";

/**
 * Questions worded the way a person types them into a chatbot, not the way an
 * SEO heading is usually written. These render visibly on the page and feed
 * FAQPage schema — a schema-only FAQ is a penalty risk, not a shortcut.
 */
export function faqsFor(technique: Technique) {
  return [
    {
      question: `What is ${technique.label.toLowerCase().replace(/^the /, "a ")}?`,
      answer: technique.definition,
    },
    {
      question: `How do you spot ${technique.label.toLowerCase().replace(/^the /, "a ")}?`,
      answer: technique.howToSpot.join(" "),
    },
    {
      question: "Why does this trick work on people?",
      answer: technique.whyItWorks,
    },
    {
      question: "What should a child ask themselves?",
      answer: technique.askYourself,
    },
  ];
}
