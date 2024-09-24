'use client';
import { useState, useEffect } from 'react';
import { deckCombinations } from './components/Deck';
import Hand from './components/Hand';

export default function BlackjackGame() {
  const [deck, setDeck] = useState(deckCombinations);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState({ winner: '', message: '' });
  const [isNewGame, setIsNewGame] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(0);
  const [betPlaced, setBetPlaced] = useState(false);

  useEffect(() => {
    if (balance <= 0) {
      setIsGameOver(true);
    }
  }, [balance]);

  const drawCard = () => {
    const randomIndex = Math.floor(Math.random() * deck.length);
    const drawnCard = deck[randomIndex];
    setDeck(deck.filter((_, index) => index !== randomIndex));
    return drawnCard;
  };

  type Card = {
    suit: string;
    rank: string;
  };

  const dealToPlayer = () => {
    const updatedHand = [...playerHand, drawCard()];
    setPlayerHand(updatedHand);
    const handValue = calculateHandValue(updatedHand);

    if (handValue > 21) {
      endGame({ winner: 'dealer', message: 'Player Bust! Dealer Wins!' });
    } else if (handValue === 21) {
      endGame({ winner: 'player', message: 'Blackjack! Player Wins!' });
    }
  };

  const dealToDealer = () => {
    if (isGameOver) return;
    setIsGameOver(true);

    const updatedHand = [...dealerHand, drawCard()];
    setDealerHand(updatedHand);
    const dealerValue = calculateHandValue(updatedHand);

    if (dealerValue > 21) {
      endGame({ winner: 'player', message: 'Dealer Bust! Player Wins!' });
    }
  };

  const calculateHandValue = (hand: Card[]) => {
    let value = 0;
    let aces = 0;

    hand.forEach((card) => {
      if (['J', 'Q', 'K'].includes(card.rank)) {
        value += 10;
      } else if (card.rank === 'A') {
        aces += 1;
        value += 11;
      } else {
        value += parseInt(card.rank);
      }
    });

    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }

    return value;
  };

  const endGame = (result: { winner: string; message: string }) => {
    setIsGameOver(true);
    setGameResult(result);

    if (!isNewGame) {
      if (result.winner === 'player') {
        setBalance((prevBalance) => prevBalance + bet);
      } else if (result.winner === 'dealer') {
        setBalance((prevBalance) => prevBalance - bet);
      }

      setIsNewGame(true);
    }
  };

  const resetGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setIsGameOver(false);
    setGameResult({ winner: '', message: '' });
    setIsNewGame(false);
    setDeck(deckCombinations);
    setBet(0);
    setBetPlaced(false);
  };

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  useEffect(() => {
    if (betPlaced && playerHand.length === 0 && dealerHand.length === 0) {
      setPlayerHand([drawCard(), drawCard()]);
      setDealerHand([drawCard()]);
    }
  }, [betPlaced, playerHand, dealerHand]);

  useEffect(() => {
    if (isGameOver) {
      let updatedDealerHand = [...dealerHand];
      while (calculateHandValue(updatedDealerHand) < 17) {
        updatedDealerHand = [...updatedDealerHand, drawCard()];
      }

      setDealerHand(updatedDealerHand);

      const finalPlayerValue = calculateHandValue(playerHand);
      const finalDealerValue = calculateHandValue(updatedDealerHand);

      if (finalPlayerValue > 21 && finalDealerValue > 21) {
        endGame({ winner: '', message: "Both Bust! It's a Draw!" });
      } else if (finalPlayerValue > 21) {
        endGame({ winner: 'dealer', message: 'Player Bust! Dealer Wins!' });
      } else if (finalDealerValue > 21) {
        endGame({ winner: 'player', message: 'Dealer Bust! Player Wins!' });
      } else if (finalPlayerValue > finalDealerValue) {
        endGame({ winner: 'player', message: 'Player Wins!' });
      } else if (finalPlayerValue < finalDealerValue) {
        endGame({ winner: 'dealer', message: 'Dealer Wins!' });
      } else {
        endGame({ winner: '', message: "It's a Draw!" });
      }
    }
  }, [isGameOver, playerHand, dealerHand]);

  const placeBet = (amount: number) => {
    if (amount <= balance) {
      setBet((prevBet) => prevBet + amount);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-black">
      <p className="fixed top-0 w-full justify-center bg-green-700 p-4 rounded-lg">
        Blackjack Game
      </p>

      <div className="Card">
        {isGameOver && (
          <div className={`font-bold rounded-md text-center py-4 ${gameResult.winner === 'player' ? 'bg-green-600' : 'bg-red-700'}`}>
            <h2 className="text-2xl">{gameResult.message}</h2>
          </div>
        )}

        <div className="flex justify-center gap-2">
          <Hand cards={playerHand} title="Player's Hand" handValue={playerValue} />
          <Hand cards={dealerHand} title="Dealer's Hand" handValue={dealerValue} />
        </div>

        <div className="flex justify-around gap-2 mt-4">
          {balance > 0 && !isNewGame ? (
            betPlaced ? (
              <>
                <button
                  onClick={dealToPlayer}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Hit
                </button>

                <button
                  onClick={dealToDealer}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Stand
                </button>
              </>
            ) : null
          ) : (
            <button
              onClick={resetGame}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Reshuffle
            </button>
          )}
        </div>

        {/* Betting system */}
        {balance > 0 ? (
          <div className="flex flex-col items-center gap-4 mt-4">
            <div>Balance: ${balance}</div>
            {!betPlaced ? (
              <>
                <div className="flex gap-4">
                  {[1, 10, 100, 500, 1000]
                    .filter((amount) => amount <= balance)
                    .map((amount) => (
                      <button
                        key={amount}
                        onClick={() => placeBet(amount)}
                        className="w-16 h-16 rounded-full bg-gray-900 text-white"
                      >
                        ${amount}
                      </button>
                    ))}
                </div>

                <div className="font-bold mt-2">Bet: ${bet}</div>

                <button onClick={() => setBet(0)} className="bg-gray-600 text-white px-6 py-2 rounded-lg">
                  Clear Bet
                </button>

                {bet > 0 && (
                  <button
                    onClick={() => setBetPlaced(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg"
                  >
                    Place Bet
                  </button>
                )}
              </>
            ) : null}
          </div>
        ) : (
          <div className="text-red-700">You have no balance left. Game over!</div>
        )}
      </div>
    </main>
  );
}
