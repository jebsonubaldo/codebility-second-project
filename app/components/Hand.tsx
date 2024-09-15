type HandProps = {
  cards: { suit: string; rank: string }[];
  title: string;
  handValue: number;
};

export default function Hand({ cards, title, handValue }: HandProps) {
  return (
    <div className="flex flex-col items-center border p-4 bg-gray-800 rounded-lg">
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <div className="flex gap-2 mb-2">
        {cards.map((card, index) => (
          <div key={index} className="text-white text-xl bg-gray-700 p-2 rounded-lg">
            {card.rank} {card.suit}
          </div>
        ))}
      </div>
      <div className="font-bold text-white">Hand Value: {handValue}</div>
    </div>
  );
}
