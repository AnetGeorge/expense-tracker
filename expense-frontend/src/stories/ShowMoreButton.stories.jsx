import React from "react";
import { action } from "@storybook/addon-actions/preview";

export default {
  title: "Components/ShowMoreButton",
};

export const Default = {
  render: () => (
    <div style={{ padding: 16, textAlign: "right" }}>
      <button
        className="show-more-btn"
        onClick={action("show-more-clicked")}
        style={{ cursor: "pointer" }}
      >
        Show More →
      </button>
    </div>
  ),
};
