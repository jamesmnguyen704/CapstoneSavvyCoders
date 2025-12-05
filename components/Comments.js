export default function Comments(state) {
  return `
    <section>
      <h2>Comments</h2>
      <form id="commentForm">
        <input type="text" id="author" placeholder="Your Name" required />
        <textarea id="text" placeholder="Your Comment" required></textarea>
        <button type="submit">Submit</button>
      </form>

      <ul>
        ${state.comments
          .map(
            c => `
          <li>
            <strong>${c.author}:</strong> ${c.text}
            <button data-id="${c._id}" class="delete-comment">Delete</button>
          </li>
        `
          )
          .join("")}
      </ul>
    </section>
  `;
}
