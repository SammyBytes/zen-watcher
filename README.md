# Zen-Watcher

**Zen-Watcher** is a lightweight, automated sentinel built with **Bun** and **TypeScript**. It monitors the **Mozilla Central (Gecko)** upstream to detect changes in "Hot Zones" that directly impact the development and stability of **Zen Browser**.

### Purpose
Developing a browser fork like Zen requires staying in sync with thousands of weekly commits from Mozilla. **Zen-Watcher** filters the noise, notifying you only when critical architectural areas—such as the sidebar, tabing engine, or UI components—are modified.

*   **Conflict Prevention:** Identify upstream changes before they cause massive merge conflicts.
*   **Smart Filtering:** Ignore irrelevant updates (locales, telemetry) and focus on the UI/UX core.
*   **Instant Alerts:** Receive detailed Discord notifications with direct links to Mercurial and GitHub mirrors.

### Technical Stack
*   **Runtime:** [Bun](https://bun.sh/) (Fast, native TypeScript support).
*   **Data Source:** Mercurial JSON API (`hg.mozilla.org`).
*   **Automation:** GitHub Actions (Scheduled polling).
*   **Persistence:** `state.json` for delta tracking.

### Quick Start

1.  **Install dependencies:**
    ```bash
    bun install
    ```

2.  **Configure your Hot Zones:**
    Edit `zones.json` to include the Gecko paths you want to monitor:
    ```json
    ["browser/components/sidebar", "browser/themes", "browser/app"]
    ```

3.  **Run the monitor:**
    ```bash
    bun run src/index.ts
    ```

### How it Works
1.  **State Check:** The script reads the last processed `pushId` from `state.json`.
2.  **Delta Fetch:** It queries Mozilla's API for all pushes occurring *after* that ID.
3.  **Zone Analysis:** It cross-references every modified file against your `HOT_ZONES`.
4.  **Notification:** If a match is found, it logs the commit details and (optionally) triggers a Discord Webhook.
5.  **Commitment:** The `state.json` is updated with the latest ID to ensure no duplicate alerts.
