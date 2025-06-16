/** @format */

import React from "react";

const CardRecommendation = ({ card }) => {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm border-gray-200 flex flex-col">
      {/* Card Image */}
      <img
        src={card.image_url || "https://via.placeholder.com/150"}
        alt={card.name}
        className="w-full h-32 object-contain mb-3 rounded"
      />

      {/* Basic Details */}
      <h4 className="text-lg font-bold text-blue-700">{card.name}</h4>
      <p className="text-sm text-gray-700">
        <strong>Issuer:</strong> {card.issuer}
      </p>
      <p className="text-sm text-gray-700">
        <strong>Rewards:</strong> {card.rewards}
      </p>
      <p className="text-sm text-gray-700">
        <strong>Perks:</strong>{" "}
        {Array.isArray(card.perks) ? card.perks.join(", ") : card.perks}
      </p>
      <p className="text-sm text-gray-700">
        <strong>Estimated Benefit:</strong> {card.estimated_benefit}
      </p>

      {/* Why This Card */}
      {card.key_reasons?.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-semibold text-gray-800">Why this card?</p>
          <ul className="list-disc text-sm text-gray-600 pl-5">
            {card.key_reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Apply Button */}
      <a
        href={card.apply_link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 text-sm text-white bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition">
        Apply Now
      </a>
    </div>
  );
};

export default CardRecommendation;
