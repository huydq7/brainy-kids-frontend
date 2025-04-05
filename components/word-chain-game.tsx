"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Check,
  ChevronRight,
  Star,
  Clock,
  RefreshCw,
  Heart,
  Lightbulb,
  Volume2,
  VolumeX,
  Trophy,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// List of common English words to use as starting words
const STARTER_WORDS = [
  "apple",
  "banana",
  "cat",
  "dog",
  "elephant",
  "fish",
  "game",
  "house",
  "ice",
  "jump",
  "kite",
  "lion",
  "monkey",
  "nest",
  "orange",
  "pencil",
  "queen",
  "rabbit",
  "sun",
  "tree",
  "umbrella",
  "van",
  "water",
  "xylophone",
  "yellow",
  "zebra",
];

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: { timePerTurn: 15, hintAllowed: true },
  medium: { timePerTurn: 10, hintAllowed: true },
  hard: { timePerTurn: 7, hintAllowed: false },
};

export default function WordChainGame() {
  const [currentWord, setCurrentWord] = useState("");
  const [inputWord, setInputWord] = useState("");
  const [wordChain, setWordChain] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [highScore, setHighScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload audio files
    const loadAudio = async () => {
      try {
        if (typeof window !== "undefined") {
          correctAudioRef.current = new Audio("/correct.wav");
          wrongAudioRef.current = new Audio("/incorrect.wav");
          timerAudioRef.current = new Audio("/time-over.mp3");

          // Preload the audio files
          await Promise.all([
            correctAudioRef.current.load(),
            wrongAudioRef.current.load(),
            timerAudioRef.current.load(),
          ]);
        }
      } catch (error) {
        console.error("Error loading audio files:", error);
      }
    };

    loadAudio();

    return () => {
      if (correctAudioRef.current) correctAudioRef.current = null;
      if (wrongAudioRef.current) wrongAudioRef.current = null;
      if (timerAudioRef.current) timerAudioRef.current = null;
    };
  }, []);

  const playSound = async (type: "correct" | "wrong" | "timer") => {
    if (!soundEnabled) return;

    try {
      if (type === "correct" && correctAudioRef.current) {
        await correctAudioRef.current.play();
      } else if (type === "wrong" && wrongAudioRef.current) {
        await wrongAudioRef.current.play();
      } else if (type === "timer" && timerAudioRef.current) {
        await timerAudioRef.current.play();
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const getRandomStarterWord = () => {
    return STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
  };

  // Start the game
  const startGame = () => {
    const startWord = getRandomStarterWord();
    setWordChain([startWord]);
    setCurrentWord(startWord);
    setInputWord("");
    setMessage("");
    setIsError(false);
    setScore(0);
    setTimeLeft(DIFFICULTY_SETTINGS[difficulty].timePerTurn);
    setIsPlaying(true);
    setGameOver(false);
    setShowHint(false);
    setHint("");
    setAchievements([]);
  };

  useEffect(() => {
    if (isPlaying && !gameOver && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isPlaying, gameOver, currentWord]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && !gameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          // Play warning sound when time is running low
          if (prev === 4 && soundEnabled) {
            playSound("timer");
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isPlaying && !gameOver) {
      handleGameOver("Time's up! Game over.");
    }

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, gameOver]);

  // Handle game over
  const handleGameOver = (message: string) => {
    setIsPlaying(false);
    setGameOver(true);
    setMessage(message);
    setIsError(true);
    playSound("wrong");

    // Update high score if current score is higher
    if (score > highScore) {
      setHighScore(score);

      // Add achievement for new high score
      if (!achievements.includes("New High Score!")) {
        setAchievements((prev) => [...prev, "New High Score!"]);
      }
    }
  };

  // Check if the word is valid
  const checkWord = async (word: string) => {
    if (!word) return false;

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      setIsLoading(false);
      return response.ok;
    } catch (error) {
      setIsLoading(false);
      console.error("Error checking word:", error);
      return false;
    }
  };

  // Get a hint
  const getHint = async () => {
    if (!DIFFICULTY_SETTINGS[difficulty].hintAllowed || showHint) return;

    const lastLetter = currentWord.charAt(currentWord.length - 1);

    const commonWords: { [key: string]: string[] } = {
      a: ["apple", "ant", "animal", "amazing", "adventure"],
      b: ["ball", "boy", "book", "banana", "butterfly"],
      c: ["cat", "car", "cake", "candy", "computer"],
      d: ["dog", "door", "day", "duck", "dinosaur"],
      e: ["egg", "elephant", "eat", "eye", "earth"],
      f: ["fish", "fun", "food", "friend", "family"],
      g: ["game", "girl", "good", "green", "garden"],
      h: ["hat", "house", "happy", "hand", "heart"],
      i: ["ice", "island", "idea", "insect", "important"],
      j: ["jump", "juice", "job", "jacket", "jungle"],
      k: ["kite", "king", "kid", "kitchen", "kangaroo"],
      l: ["lion", "love", "light", "leaf", "lemon"],
      m: ["monkey", "moon", "mom", "music", "magic"],
      n: ["nest", "night", "nose", "name", "number"],
      o: ["orange", "ocean", "owl", "open", "office"],
      p: ["pencil", "pizza", "park", "purple", "planet"],
      q: ["queen", "quiet", "quick", "question", "quilt"],
      r: ["rabbit", "red", "rain", "river", "robot"],
      s: ["sun", "star", "school", "snake", "smile"],
      t: ["tree", "toy", "tiger", "time", "table"],
      u: ["umbrella", "up", "uncle", "under", "unicorn"],
      v: ["van", "voice", "very", "violet", "vacation"],
      w: ["water", "window", "world", "watch", "winter"],
      x: ["xylophone", "x-ray"],
      y: ["yellow", "yes", "year", "young", "yummy"],
      z: ["zebra", "zoo", "zero", "zigzag", "zone"],
    };

    const possibleWords = commonWords[lastLetter] || [];
    if (possibleWords.length > 0) {
      const randomWord =
        possibleWords[Math.floor(Math.random() * possibleWords.length)];
      setHint(randomWord);
      setShowHint(true);

      setScore((prev) => Math.max(0, prev - 2));
    } else {
      setHint("No hint available");
      setShowHint(true);
    }
  };

  const checkAchievements = (newScore: number, chainLength: number) => {
    const newAchievements = [...achievements];

    if (newScore >= 10 && !achievements.includes("Beginner")) {
      newAchievements.push("Beginner");
    }
    if (newScore >= 25 && !achievements.includes("Word Explorer")) {
      newAchievements.push("Word Explorer");
    }
    if (newScore >= 50 && !achievements.includes("Vocabulary Master")) {
      newAchievements.push("Vocabulary Master");
    }

    if (chainLength >= 5 && !achievements.includes("Chain Builder")) {
      newAchievements.push("Chain Builder");
    }
    if (chainLength >= 10 && !achievements.includes("Chain Master")) {
      newAchievements.push("Chain Master");
    }

    if (newAchievements.length > achievements.length) {
      setAchievements(newAchievements);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPlaying || gameOver) return;

    const trimmedWord = inputWord.trim().toLowerCase();

    const lastLetter = currentWord.charAt(currentWord.length - 1);

    if (!trimmedWord.startsWith(lastLetter)) {
      handleGameOver(`Word must start with the letter "${lastLetter}"!`);
      return;
    }

    if (wordChain.includes(trimmedWord)) {
      handleGameOver("You've already used this word!");
      return;
    }

    const isValid = await checkWord(trimmedWord);

    if (isValid) {
      setCurrentWord(trimmedWord);
      setWordChain([...wordChain, trimmedWord]);
      setInputWord("");
      setMessage("Correct! Keep going!");
      setIsError(false);

      const difficultyMultiplier =
        difficulty === "easy" ? 1 : difficulty === "medium" ? 1.5 : 2;
      const wordScore = Math.ceil(trimmedWord.length * difficultyMultiplier);
      const newScore = score + wordScore;

      setScore(newScore);

      setTimeLeft(DIFFICULTY_SETTINGS[difficulty].timePerTurn);

      setShowHint(false);
      setHint("");

      checkAchievements(newScore, wordChain.length + 1);

      playSound("correct");

      if (newScore > 0 && newScore % 25 === 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } else {
      handleGameOver("That's not a valid English word!");
    }
  };

  const useHint = () => {
    if (hint && showHint) {
      setInputWord(hint);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-3 md:p-4">
      <Card className="border border-border/40 shadow-md overflow-hidden">
        <CardHeader className="p-3 md:p-4 bg-muted/30 space-y-1 pb-3 border-b border-border/20">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
              Word Chain Game
              <span className="block text-xs md:text-sm font-normal text-muted-foreground mt-1">
                Connect words using the last letter of the previous word
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-8 w-8"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 space-y-4">
          {!isPlaying && !gameOver ? (
            <div className="text-center space-y-4">
              <div className="bg-primary/5 rounded-lg p-3 md:p-4">
                <h2 className="text-lg font-semibold text-primary mb-2">
                  Ready to play?
                </h2>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll start with a random word. Continue the chain with
                  words that start with the last letter of the previous word.
                </p>
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-sm font-medium text-foreground">
                  Select Difficulty:
                </h3>
                <Select
                  value={difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") =>
                    setDifficulty(value)
                  }
                >
                  <SelectTrigger className="w-full bg-background/50 border-border text-sm h-9">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">
                      Easy (15s per turn, hints allowed)
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium (10s per turn, hints allowed)
                    </SelectItem>
                    <SelectItem value="hard">
                      Hard (7s per turn, no hints)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {highScore > 0 && (
                <div className="flex justify-center items-center gap-2 text-primary py-2 rounded-lg">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    High Score: {highScore}
                  </span>
                </div>
              )}

              <Button
                onClick={startGame}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm px-6 py-2 h-auto rounded-md shadow-sm hover:shadow transition-all"
              >
                Start Game
              </Button>
            </div>
          ) : gameOver ? (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-destructive">
                  Game Over
                </h2>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>

              <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  Final Score: {score}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Words in chain: {wordChain.length}
                </p>

                {highScore === score && score > 0 && (
                  <div className="mt-2 text-primary flex justify-center items-center gap-2 bg-primary/10 p-2 rounded-lg">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm font-medium">New High Score!</span>
                  </div>
                )}
              </div>

              {achievements.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-foreground">
                    Achievements:
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {achievements.map((achievement, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="py-1 px-2 text-xs"
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={startGame}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm px-6 py-2 h-auto rounded-md shadow-sm hover:shadow transition-all mt-2"
              >
                Play Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-md">
                  <Star className="text-primary h-4 w-4" />
                  <span className="font-medium">Score: {score}</span>
                </div>
                <div className="flex items-center gap-2 justify-center bg-muted/20 p-2 rounded-md">
                  <Heart className="text-destructive h-4 w-4" />
                  <span className="font-medium">Lives: 1</span>
                </div>
                <div className="flex items-center gap-2 justify-end bg-muted/20 p-2 rounded-md">
                  <Clock
                    className={`h-4 w-4 ${
                      timeLeft <= 5
                        ? "text-destructive animate-pulse"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      timeLeft <= 5 ? "text-destructive" : ""
                    }`}
                  >
                    {timeLeft}s
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-5">
                <div className="md:col-span-2 bg-primary/5 p-3 rounded-md space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Current word:
                    <span className="ml-1 text-primary font-bold">
                      {currentWord}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Next word must start with:{" "}
                    <span className="text-base font-bold text-primary inline-block px-2 py-1 bg-primary/10 rounded-md mt-1">
                      {currentWord.charAt(currentWord.length - 1)}
                    </span>
                  </p>
                </div>

                <div className="md:col-span-3 overflow-auto">
                  <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        type="text"
                        value={inputWord}
                        onChange={(e) => setInputWord(e.target.value)}
                        placeholder="Type your word..."
                        className="flex-1 h-9 text-sm"
                        disabled={!isPlaying || isLoading || gameOver}
                      />
                      <Button
                        type="submit"
                        disabled={
                          !inputWord.trim() ||
                          !isPlaying ||
                          isLoading ||
                          gameOver
                        }
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-9 p-0"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </form>

                  {DIFFICULTY_SETTINGS[difficulty].hintAllowed && (
                    <div className="flex justify-between items-center mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={getHint}
                        disabled={showHint || !isPlaying || gameOver}
                        className="text-primary border-primary text-xs h-7"
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Get Hint (-2 pts)
                      </Button>

                      {showHint && hint && (
                        <div className="flex items-center gap-2 bg-background/50 p-1 rounded-md">
                          <span className="text-xs text-muted-foreground">
                            Try:{" "}
                            <strong className="text-primary">{hint}</strong>
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={useHint}
                            className="h-6 text-xs p-0 px-2"
                          >
                            Use
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted/10 p-2 rounded-md">
                <h3 className="text-xs font-medium text-muted-foreground mb-2">
                  Chain History:
                </h3>
                <div className="flex flex-wrap gap-1">
                  <AnimatePresence>
                    {wordChain.map((word, index) => (
                      <motion.div
                        key={`${word}-${index}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant="secondary"
                          className="py-1 px-2 text-xs bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          {word}
                          {index < wordChain.length - 1 && (
                            <ChevronRight className="ml-1 h-3 w-3 inline" />
                          )}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {message && (
                <Alert
                  variant={isError ? "destructive" : "default"}
                  className="text-xs py-2 px-3"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <AlertDescription className="text-xs">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {achievements.length > 0 && (
                <div className="bg-muted/10 p-2 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="text-primary h-3 w-3" />
                    <h3 className="text-xs font-medium">
                      Recent Achievements:
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {achievements.slice(-3).map((achievement, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs py-0.5 px-2 border-primary/10"
                      >
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
