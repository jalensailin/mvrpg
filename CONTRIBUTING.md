# Contributing

## Testing The System

### Install Instructions

- Open Foundry and navigate to the **Systems** tab.
- Click "Install System" at the top of this tab.
- Navigate to the bottom of the Install System window, and you will see a text-box labeled "Manifest URL"
- Paste the following link into that text-box and press the "Install" button.
  - Manifest Link: <https://raw.githubusercontent.com/jalensailin/mvrpg/main/system.json>

### Update Instructions

- Typically, you can update via the normal Foundry path, i.e. clicking the 'circle-arrows' button in the bottom-left corner of the MV RPG's system card, under the Game Systems tab.
  - This will only work, however, if I remembered to increment the version number in `system.json` along with my most recent changes.
  - If you see that I have made changes to the system, and the normal update path isn't working, instead, simply uninstall and reinstall the system from the above link.

### Using Github

1. Go to [Github](https://github.com) and make an account if you do not already have one.
2. Navigate to the [project page](https://github.com/jalensailin/mvrpg), also called the repository or 'repo':
3. There you will find multiple sections across the top of repo, the most important section for you is the "Issues" section.
4. Whenever you find a bug or other issue, create an Issue for it in the Issues tab.
   - Give the issue a descriptive title
   - Expand on your issue in the Description.
   - Descriptions should include the following:
     - Steps to reproduce the issue.
     - **Screenshots** (not copy/paste) of any errors in the console (f12) encountered during the issue.
     - Further details on what makes this an issue (describe the bug, rules issue, style issue, expected behavior, etc.).
     - For example, "The rules from the book work like ABC but in the system it currently works like XYZ. I think its possible you misinterpreted that rule. To see what I mean, try the following steps..."
   - Submit your issue and I will give it appropriate labels/priority/milestone for tracking purposes.
   - I will respond to the issue with my thoughts, expectations, ideas for solving it, etc.
   - Once issues have been solved in a satisfactory way, or otherwise deemed not-relevant, they will be closed. If someone realizes that I messed up, and the issue still exists, we can always reopen it. If a new bug arises as a result of fixing an old issue, we will make a new issue for that bug.

### Doing The Testing

- Download the system and make a new world.
- Press F12 to open the console and keep it open while you test. Make note of any errors you encounter.
- Play around with the system's offerings: Make an Actor, make Items, roll some dice, try it with `Dice So Nice` and see how that works, etc.
- See what is easy to use, see what is difficult to use, what's obvious, what isn't.
- Feel free to ask me questions or request clarifications via Discord.
- Report anything that seems like a potential issue on the [Github Issues Page](https://github.com/jalensailin/mvrpg/issues).
  - I typically will sort Issues by priority. Note, this list is more of a guideline than a rule. Individual issues may be deemed higher or lower priority depending on its unique details.
  - High priority:
    - Game-breaking bugs
    - Support for game rules which are currently missing and are required for smoothly playing the game, or are otherwise incorrect.
    - Simple feature requests that greatly improve quality-of-life and are easy to implement.
  - Medium priority:
    - Minor bugs that don't impact gameplay
    - Support for rules that help smooth out gameplay or track certain things, but aren't strictly necessary and wouldn't take a lot of work to implement
    - Support for simple homebrew.
  - Low Priority:
    - Fancy feature requests that may require a lot of work and/or aren't really necessary or widely applicable.
    - Support for rules that are pretty easy to track manually and/or would take a long time to implement.
    - Support for complex homebrew.
