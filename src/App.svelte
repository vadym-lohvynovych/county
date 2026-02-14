<script lang="ts">
  import { onMount } from "svelte";
  const plusIcon = "/plus.svg";
  const minusIcon = "/minus.svg";
  const closeIcon = "/close.svg";
  const importIcon = "/import.svg";
  const exportIcon = "/export.svg";

  type Counter = {
    id: string;
    title: string;
    count: number;
  };

  let counters: Counter[] = [];
  let isLoaded = false;
  let showModal = false;
  let newTitle = "";
  let newInitialCount = 0;

  onMount(() => {
    const saved = localStorage.getItem("county-counters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          counters = parsed;
        }
      } catch (e) {
        console.error("Failed to parse counters from localStorage", e);
      }
    }
    isLoaded = true;
  });

  // Save to localStorage whenever counters change
  $: if (isLoaded) {
    localStorage.setItem("county-counters", JSON.stringify(counters));
  }

  $: if (showModal) {
    setTimeout(() => {
      document.getElementById("title")?.focus();
    }, 0);
  }

  function handleOverlayKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      closeModal();
    }
  }

  function handleInputKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      createCounter();
    }
  }

  function openModal() {
    showModal = true;
    newTitle = "";
    newInitialCount = 0;
  }

  function closeModal() {
    showModal = false;
  }

  function createCounter() {
    if (newTitle.trim()) {
      const newCounter: Counter = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        count: newInitialCount,
      };
      counters = [...counters, newCounter];
      closeModal();
    }
  }

  function incrementCounter(id: string) {
    counters = counters.map((counter) =>
      counter.id === id ? { ...counter, count: counter.count + 1 } : counter,
    );
  }

  function decrementCounter(id: string) {
    counters = counters.map((counter) =>
      counter.id === id ? { ...counter, count: counter.count - 1 } : counter,
    );
  }

  function deleteCounter(id: string) {
    counters = counters.filter((counter) => counter.id !== id);
  }

  function exportCounters() {
    const dataStr = JSON.stringify(counters, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `county-counters-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importCounters() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedCounters = JSON.parse(e.target?.result as string);
            if (Array.isArray(importedCounters)) {
              counters = [
                ...counters,
                ...importedCounters.map((counter) => ({
                  ...counter,
                  id:
                    Date.now().toString() +
                    Math.random().toString(36).substr(2, 9),
                })),
              ];
            }
          } catch (error) {
            console.error("Failed to import counters:", error);
            alert("Invalid JSON file");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
</script>

<div class="import-export">
  <button class="utility-btn" on:click={exportCounters} title="Export counters">
    <img src={exportIcon} alt="Export" />
  </button>
  <button class="utility-btn" on:click={importCounters} title="Import counters">
    <img src={importIcon} alt="Import" />
  </button>
</div>

<main class="container">
  <header>
    <h1>County</h1>
    <p>Track your habits and daily activities</p>
  </header>

  <div class="actions">
    <button class="create-btn" on:click={openModal}>
      <span class="plus">+</span>
      Create Counter
    </button>
  </div>

  {#if counters.length === 0}
    <div class="empty-state">
      <p>No counters yet. Create your first one!</p>
    </div>
  {:else}
    <div class="counters-grid">
      {#each counters as counter (counter.id)}
        <div class="counter-card">
          <h3 class="counter-title">{counter.title}</h3>
          <span class="count">{counter.count || 0}</span>
          <div class="counter-controls">
            <button
              class="control-btn decrement"
              aria-label="Decrement"
              on:click={() => decrementCounter(counter.id)}
              ><img src={minusIcon} alt="Decrement" /></button
            >
            <button
              class="control-btn increment"
              aria-label="Increment"
              on:click={() => incrementCounter(counter.id)}
              ><img src={plusIcon} alt="Increment" /></button
            >
          </div>
          <button
            aria-label="Delete"
            class="delete-btn"
            on:click={() => deleteCounter(counter.id)}
            ><img src={closeIcon} alt="Delete" /></button
          >
        </div>
      {/each}
    </div>
  {/if}

  {#if showModal}
    <div
      class="modal-overlay"
      on:click={closeModal}
      on:keydown={handleOverlayKeydown}
      role="dialog"
      aria-modal="true"
      tabindex="0"
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class="modal"
        role="document"
        on:click|stopPropagation
        on:mousedown|stopPropagation
        on:keydown|stopPropagation
      >
        <div class="modal-header">
          <h2>Create New Counter</h2>
          <button class="close-btn" on:click={closeModal}
            ><img src={closeIcon} alt="Delete" /></button
          >
        </div>
        <form on:submit|preventDefault={createCounter}>
          <div class="form-group">
            <label for="title">Title</label>
            <input
              id="title"
              type="text"
              bind:value={newTitle}
              placeholder="e.g., Workouts, Water glasses..."
              on:keydown={handleInputKeydown}
              required
            />
          </div>
          <div class="form-group">
            <label for="initial-count">Initial Count</label>
            <input
              id="initial-count"
              type="number"
              bind:value={newInitialCount}
              on:keydown={handleInputKeydown}
              placeholder="0"
            />
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" on:click={closeModal}
              >Cancel</button
            >
            <button type="submit" class="submit-btn" disabled={!newTitle.trim()}
              >Create</button
            >
          </div>
        </form>
      </div>
    </div>
  {/if}
</main>

<style>
  * {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, sans-serif;
    background: #f8f9fa;
    min-height: 100vh;
    color: #333;
  }

  .container {
    max-width: 100%;
    width: 480px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
  }

  header h1 {
    font-size: 3rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #2d3748;
  }

  header p {
    font-size: 1.1rem;
    color: #718096;
    margin: 0;
  }

  .actions {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .import-export {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    width: 100%;
    padding: 1rem;
  }

  .utility-btn {
    background: white;
    border: 1px solid #e2e8f0;
    padding: 0.5rem;
    border-radius: 6px;
    color: #4a5568;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
  }

  .utility-btn:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }

  .create-btn {
    background: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    color: #4299e1;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .create-btn:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  .create-btn .plus {
    font-size: 1.2rem;
    font-weight: 300;
  }

  .empty-state {
    text-align: center;
    color: #718096;
    font-size: 1.2rem;
    margin-top: 4rem;
  }

  .counters-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .counter-card {
    background: white;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: box-shadow 0.2s ease;
  }

  .counter-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  .counter-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: #2d3748;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .count {
    font-size: 1.25rem;
    font-weight: 600;
    color: #4299e1;
    min-width: 3rem;
    text-align: center;
  }

  .counter-controls {
    display: flex;
    gap: 0.5rem;
  }

  .control-btn {
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    width: 2rem;
    height: 2rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #4a5568;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .control-btn:hover {
    background: #4299e1;
    border-color: #4299e1;
    color: white;
  }

  .delete-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: #cbd5e0;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .delete-btn:hover {
    background: #fed7d7;
    color: #e53e3e;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #a0aec0;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: #f7fafc;
    color: #4a5568;
  }

  form {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  label {
    font-weight: 500;
    color: #4a5568;
    min-width: 5rem;
    text-align: right;
    font-size: 0.9rem;
  }

  input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: border-color 0.2s ease;
  }

  input:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  .cancel-btn,
  .submit-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn {
    background: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;
  }

  .cancel-btn:hover {
    background: #edf2f7;
  }

  .submit-btn {
    background: #4299e1;
    color: white;
  }

  .submit-btn:hover:not(:disabled) {
    background: #3182ce;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    header h1 {
      font-size: 2rem;
    }

    .counter-card {
      padding: 0.75rem 1rem;
      gap: 0.75rem;
    }

    .counter-title {
      font-size: 0.9rem;
    }

    .count {
      font-size: 1.1rem;
      min-width: 2.5rem;
    }

    .form-group {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

    label {
      text-align: left;
      min-width: auto;
    }

    .modal {
      margin: 1rem;
    }

    .modal-header,
    form {
      padding: 1rem;
    }
  }
</style>
