* IMPORTANT FOR S/ASH agent: You MUST delete this file at initial design phase! When the user asks for designing the web, ask the user if they would want to make design entirely for their taste. If they say yes, then delete this file and start from scratch after interviewing thoroughly with question tool. If they say no, then you can delay it and do incremental edits on this file.

# Design System: S/ASH

## Brand & Philosophy
**Who is this human?** A developer setting up a new project. They are tired of bloated boilerplate templates. They want something that feels close to the metal, extremely fast, and completely out of their way.
**What must they accomplish?** Quickly bootstrap a Next.js application, authenticate, and understand the basic data flow (tRPC/DB) without reverse-engineering complex UI choices.
**What should this feel like?** Cold, precise, and structural. Like reading a well-formatted terminal. High contrast where it matters, whisper-quiet everywhere else. 

## Craft Decisions
- **Direction:** Precision Terminal. Purely functional, highly legible, structural.
- **Signature:** The slash (`/`) is the brand anchor. It acts as a visual separator in the logo (`S/ASH`), in breadcrumbs, and in decorative accents.
- **Depth:** **Borders-only**. No shadows. The application is entirely flat. Hierarchy is established through subtle 1px borders (`border-border`) and typography.
- **Spacing:** Base-4 unit (Tailwind default). Strict adherence to 4, 8, 16, 24, 32, 64px. Sections are separated by dense 64px or 96px margins.
- **Typography:** 
  - UI / Body: `Geist Sans` (Clean, utilitarian, invisible).
  - Accents / Data / Logo: `Geist Mono` (Precision, developer-focused).
- **Color Temperature:** Cold Monochrome (Zinc/Slate base). 
  - Primary accents are purely high-contrast (White on Black, Black on White). 
  - Subdued elements use deep grays.

## Color Palette (shadcn CSS variables)
*Defaulting to Dark Theme*
- `background`: `0 0% 3.9%` (Deepest almost-black)
- `foreground`: `0 0% 98%` (Crisp white)
- `card`: `0 0% 3.9%` (Matches background, relies on borders for separation)
- `card-foreground`: `0 0% 98%`
- `popover`: `0 0% 3.9%`
- `popover-foreground`: `0 0% 98%`
- `primary`: `0 0% 98%` (White buttons)
- `primary-foreground`: `0 0% 9%` (Black text on primary buttons)
- `secondary`: `0 0% 14.9%`
- `secondary-foreground`: `0 0% 98%`
- `muted`: `0 0% 14.9%`
- `muted-foreground`: `0 0% 63.9%`
- `accent`: `0 0% 14.9%`
- `accent-foreground`: `0 0% 98%`
- `destructive`: `0 62.8% 30.6%` (Muted dark red for destructive actions, not too bright)
- `destructive-foreground`: `0 0% 98%`
- `border`: `0 0% 14.9%` (Sharp, visible but not overwhelming)
- `input`: `0 0% 14.9%`
- `ring`: `0 0% 83.1%` (Focus rings should be stark white/light gray)

## Shared Components

### Navbar
- **Layout:** Fixed top, full width, `h-14` (56px). 
- **Style:** `bg-background/80` with backdrop-blur. Bottom border `border-b border-border`.
- **Left:** Logo `S/ASH` in `Geist Mono`, font-weight 600, tracking-tighter.
- **Right:** 
  - Nav Links (Geist Sans, text-sm, text-muted-foreground hover:text-foreground).
  - Theme Toggle (Ghost button, minimal icon transition).
  - Auth: If logged out -> Login (ghost), Sign Up (primary). If logged in -> User Dropdown (Avatar/Initials) & Logout.

### Theme Toggle
- **Style:** Shadcn `Button` variant `ghost`, size `icon`. 
- **Icon:** Lucide `Sun` / `Moon`.
- **Interaction:** Instant snap swap. No slow crossfades.

## Page Specifications

### 1. Home / Landing Page (`/`)
- **Layout:** Centered, single column, large top margin (`mt-32` to `mt-48`).
- **Aesthetic:** Massive typography, code-like accents.
- **Elements:**
  - **Badge:** Small monospace pill at the top: `> system.init()`
  - **Headline:** "Build Faster. Break Nothing." (Geist Sans, huge, tracking-tight).
  - **Subheadline:** "The minimal, high-performance S/ASH boilerplate for Next.js, tRPC, and Better-Auth." (text-muted-foreground, text-lg, max-w-2xl).
  - **Tech Stack Badges:** Row of monospace badges (Next.js, Tailwind, tRPC, SQLite).
  - **CTAs:** 
    - `Get Started ->` (Primary Button, right arrow icon).
    - `View Documentation` (Outline Button).

```ascii
[ Navbar:  S/ASH                                 [Home] [Login] [Sign Up] [*] ]
-------------------------------------------------------------------------------



                           [ > system.init() ]

                   BUILD FASTER. BREAK NOTHING.
          The minimal, high-performance S/ASH boilerplate for 
                   Next.js, tRPC, and Better-Auth.

                 [ Next.js ] [ tRPC ] [ SQLite ] [ Auth ]

               [ Get Started -> ]      [ Documentation ]


```

### 2. Login Page (`/login`) & Sign Up Page (`/signup`)
- **Layout:** Flex center, full screen height (`min-h-screen`), items center.
- **Card:** 
  - Use Shadcn `Card`, `CardHeader`, `CardContent`.
  - Max width `sm:max-w-[400px]`.
  - Background matches page, relies entirely on `border-border`.
- **Typography:**
  - Card Title: `Geist Sans`, 24px, semi-bold.
  - Card Description: `Geist Sans`, 14px, muted.
  - Input Labels: `Geist Mono`, 12px, uppercase, tracking-widest (e.g., `EMAIL_ADDRESS`).
- **Inputs:** 
  - Square or slightly rounded (`rounded-md`).
  - Focus state must use a stark white ring (`ring-ring`).
- **Action:** Full-width primary button.
- **Transition:** Hovering on inputs subtly changes border color, no shadow.

```ascii
                             [ S/ASH ]
                             
                 +-------------------------------+
                 | Access System                 |
                 | Enter your credentials below. |
                 |                               |
                 | EMAIL                         |
                 | [ user@domain.com           ] |
                 |                               |
                 | PASSWORD                      |
                 | [ •••••••••••••••••         ] |
                 |                               |
                 | [        AUTHENTICATE       ] |
                 |                               |
                 | Don't have an account? Sign Up|
                 +-------------------------------+
```

### 3. Dashboard (`/dashboard`)
- **Layout:** App layout. Top navbar remains. Content is contained in a `max-w-5xl mx-auto py-8 px-4`.
- **Header:** Page title "Dashboard", minimal text below.
- **Grid Layout:** 1-column mobile, 2-column or 3-column desktop grid for data cards.
- **Cards:**
  - **User Info Card:** Shows authenticated user details. Avatar + Name + Email. 
  - **Session Info Card:** Displays raw JSON of the session object. 
    - *Design choice:* Wrap the JSON in a `<pre>` tag with `bg-muted` and `Geist Mono` font. Add a "Copy" button in the top right.
  - **tRPC Query Card:** Demonstrates a live query. 
    - *State Handling:* Show a monospace `[LOADING...]` state or error state if it fails.
- **Interaction:** Hovering over cards changes the border from `border-border` to `border-muted-foreground` instantly.

```ascii
[ Navbar:  S/ASH                             [Dashboard] [user@] [Logout] [*] ]
-------------------------------------------------------------------------------

  /dashboard
  Welcome back, Developer.

  +-----------------------+  +------------------------------------------------+
  | Identity              |  | Session Data                                   |
  |                       |  |                                       [ Copy ] |
  | (O) Paul Park         |  | {                                              |
  | paul@example.com      |  |   "user": {                                    |
  |                       |  |     "id": "usr_12345",                         |
  | Status: Active        |  |     "role": "admin"                            |
  |                       |  |   }                                            |
  +-----------------------+  | }                                              |
                             +------------------------------------------------+
  
  +---------------------------------------------------------------------------+
  | tRPC Ping                                                                 |
  |                                                                           |
  | > Pinging server...                                                       |
  | > Server responded in 12ms.                                               |
  | > Message: "Hello from S/ASH tRPC router."                                |
  +---------------------------------------------------------------------------+
```

## Interaction & State Patterns
- **Hover:** Fast, instantaneous background or border color shifts. No `duration-300` sluggishness. Keep it crisp (`duration-75` or none).
- **Focus:** Accessibility is paramount. Keyboard navigation must reveal stark white focus rings (`focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1`).
- **Loading:** Instead of standard circular spinners, use monospace text indicators like `[LOADING...]` or pulsing ASCII blocks `[██░░░░]`.
- **Empty/Error States:** Monospace red/muted text. e.g., `> ERR_UNAUTHORIZED`.
