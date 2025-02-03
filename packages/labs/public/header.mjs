import { attachShadow } from "./utils.mjs";

const TEMPLATE = document.createElement("template");
TEMPLATE.innerHTML = `
    <style>
        header {
            background-color: var(--color-header);
            border: 5px solid var(--color-accent);
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: space-between;
            padding: 0.5em;
            width: 100%;
            max-width: 100%; /* Ensures the header doesn't exceed the screen width */
            box-sizing: border-box; /* Ensures padding and borders are included in the width */
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }

        header h1 {
            font-size: 180%;
            font-style: italic;
            font-weight: bold;
            color: var(--color-title);
            padding: 1em;
            margin: 0;
            white-space: nowrap;
        }

        nav{
            display: none;
        }

        nav ul {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        nav a {
            font-size: 100%;
            color: var(--color-link);
            display: block;
            padding: 0.5em 1em;
            text-decoration: none;
            white-space: nowrap;
        }

        .menu-button {
            background: var(--color-accent);
            color: white;
            border: none;
            padding: 0.5em 1em;
            cursor: pointer;
            font-size: 100%;
        }

        label {
            display: flex;
            align-items: center;
            margin-right: 1em;
            cursor: pointer;
        }

        input[type="checkbox"] {
            margin-right: 0.5em;
        }
        
        nav {
            display: none;
        }

        nav.open {
            display: block;
        }

        @media (min-width: 769px) {
            header {
                flex-direction: row;
                align-items: center;
            }

            nav{
                display: inline;
            }

            nav ul {
                flex-direction: row;
                width: auto;

            }

            .menu-button {
                display: none;
            }
        }
    </style>

    <header>
        <div class="header-top">
            <h1>Sam Morrisroe</h1>
            <label>
                <input type="checkbox" autocomplete="off" id="dark-mode-toggle" />
                Dark mode
            </label>
            <button class="menu-button">Menu</button>
        </div>
        <nav>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="">Projects</a></li>
                <li><a href="guitar.html">Guitar</a></li>
            </ul>
        </nav>
    </header>
`;

class MyHeader extends HTMLElement {
    connectedCallback() {
        attachShadow(this, TEMPLATE);

        // Select the button and add the event listener
        const menuButton = this.shadowRoot.querySelector('.menu-button');
        menuButton.addEventListener('click', this.toggleMenu.bind(this));

        const darkModeToggle = this.shadowRoot.querySelector('#dark-mode-toggle');
        // Check if dark mode is enabled in localStorage and update the checkbox
        if (localStorage.getItem('dark-mode') === 'true') {
            darkModeToggle.checked = true;
            document.body.classList.add('dark-mode');
        }

        // Add event listener to toggle dark mode
        darkModeToggle.addEventListener('change', (event) => {
            const isDarkMode = event.target.checked;
            if (isDarkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }

            // Save the state of dark mode in localStorage
            localStorage.setItem('dark-mode', isDarkMode);
        });
    }

    


    // Method to toggle the navigation menu visibility
    toggleMenu() {
        const nav = this.shadowRoot.querySelector('nav');
         nav.classList.toggle('open');   
    }
}



customElements.define("my-header", MyHeader);
