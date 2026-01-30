// /lib/i18n.ts
import { I18n } from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppLocale = "en" | "hr" | "it" | "sl" | "fr" | "de" | "es" | "rs";

const LOCALE_KEY = "famigo.locale";

const en = {
  "tabs": {
    "home": "Home",
    "members": "Members",
    "tasks": "Tasks",
    "shopping": "Shopping",
    "settings": "Settings"
  },
  "onboarding": {
    "profile": {
      "title": "Set up your profile",
      "subtitle": "This helps the family recognize who is who.",
      "name": "Your name",
      "role": "You are",
      "gender": "Gender",
      "male": "Male",
      "female": "Female",
      "autoAvatar": "Avatar will be set automatically"
    },
    "family": {
      "title": "Join or create a family",
      "subtitle": "You can join with a code or create a new family.",
      "joinTitle": "Join existing family",
      "joinSub": "Enter the family code you got from a parent.",
      "createTitle": "Create a new family",
      "createSub": "Pick a family name and invite others later."
    }
  },
  "common": {
    "loading": "Loading...",
    "ok": "OK",
    "cancel": "Cancel",
    "save": "Save",
    "error": "Error",
    "delete": "Delete",
    "copied": "Copied.",
    "copyFailed": "Could not copy.",
    "info": "Info",
    "me": "Me",
    "all": "All",
    "on": "On",
    "off": "Off",
    "remove": "Remove",
    "rename": "Rename",
    "success": "Success",
    "back": "Back",
    "create": "Create",
    "join": "Join",
    "continue": "Continue",
    "male": "Male",
    "female": "Female"
  },
  "settings": {
    "title": "Settings",
    "subtitle": "Family, language and profile",
    "setup": {
      "title": "Set up your account",
      "step1": "1) Join or create a family",
      "step2": "2) Then set your name in Settings → Family",
      "whyName": "Your name is stored as a family member, so it becomes available after you join a family.",
      "next": "Next step",
      "setNameNow": "Please set your name so others can recognize you."
    },
    "language": "Language",
    "languageHint": "Choose the interface language.",
    "languageNote": "This change applies to the whole app.",
    "croatian": "Croatian",
    "english": "English",
    "italian": "Italian",
    "slovenian": "Slovenian",
    "french": "French",
    "german": "German",
    "spanish": "Spanish",
    "serbian": "Serbian",
    "myName": "My name",
    "myNamePlaceholder": "Name",
    "nameRequired": "Please enter a name.",
    "saved": "Saved.",
    "family": {
      "notInFamily": "You are not in a family.",
      "statusLine": "Family: {{name}} (Invite: {{code}})",
      "title": "Family",
      "notInFamilyTitle": "No family yet"
    },
    "about": "About",
    "account": "Account",
    "aboutLine": "Family app for tasks and organization.",
    "version": "Version",
    "family_not_in_family": "You are not in a family.",
    "btn": {
      "changeLanguage": "Change language ({{lang}})",
      "editName": "Edit name",
      "copy": "Copy",
      "renameFamily": "Rename",
      "setName": "Set your name",
      "leaveFamily": "Leave family",
      "deleteFamily": "Delete family",
      "showInviteCode": "Show invite code",
      "hideInviteCode": "Hide invite code",
      "createFamily": "Create family",
      "joinFamily": "Join family",
      "join": "Join"
    },
    "msg": {
      "familyRenamed": "Family name updated."
    },
    "renameFamilyTitle": "Rename family",
    "renameFamilyPlaceholder": "Family name",
    "labels": {
      "family": "Family",
      "inviteCode": "Invite code",
      "myName": "Your name"
    },
    "notSet": "Not set",
    "nameAfterJoin": "Join or create a family to set your name.",
    "deleteFamily": {
      "help": "You can delete the family only when you are the only member.",
      "title": "Delete family",
      "body": "This will permanently delete the family and all its data.",
      "confirm": "Type DELETE to confirm.",
      "deleted": "Family deleted."
    },
    "joinFamily": {
      "help": "Enter an invite code from a family member.",
      "title": "Join family",
      "placeholder": "Invite code",
      "invalidCode": "Enter invite code.",
      "joined": "You are now in the family."
    },
    "createFamily": {
      "title": "Create family",
      "desc": "Create a new family to start sharing tasks.",
      "placeholder": "Family name",
      "nameRequired": "Family name is required.",
      "created": "Family created."
    },
    "leaveFamily": {
      "title": "Leave family",
      "body": "Are you sure you want to leave the family?",
      "confirm": "Leave",
      "left": "You left the family."
    },
    "myProfile": "My profile"
  },
  "tasks": {
    "status": {
      "open": "Open",
      "claimed": "Claimed",
      "review": "Needs approval",
      "done": "Done"
    },
    "filter": {
      "all": "All",
      "active": "Active",
      "review": "Needs approval",
      "done": "Done"
    },
    "badge": {
      "open": "Otvoreno",
      "done": "Gotovo"
    },
    "action": {
      "accept": "Prihvati",
      "reject": "Odbij",
      "take": "Preuzmi",
      "doneAuto": "Gotovo"
    },
    "timelineHint": {
      "assigned": "Assigned → Done → Approved",
      "created": "Created → Done → Approved"
    },
    "hideDoneOn": "Hide done: ON",
    "hideDoneOff": "Hide done: OFF",
    "emptyTitle": "No tasks",
    "emptySubtitle": "Create the first task with + New",
    "actionsTitle": "Task actions",
    "edit": "Edit",
    "editTitle": "Edit task",
    "newTitle": "New task",
    "titlePlaceholder": "e.g. Pick up kids",
    "timePlaceholder": "Type (HHMM) e.g. 1630",
    "assignedTo": "Assign to",
    "noAssignee": "Everyone",
    "titleRequired": "Title is required.",
    "deleteConfirm": "Delete this task?",
    "claim": "Claim",
    "unclaim": "Unclaim",
    "requestDone": "Request done",
    "approve": "Approve",
    "reject": "Reject",
    "reset": "Reset",
    "title": "Tasks",
    "heroSub": "Quick filters and overview",
    "newBtn": "+ New",
    "new": {
      "title": "Create a new task for a family member",
      "placeholder": {
        "title": "e.g. Take Luka to soccer practice",
        "time": "e.g. 16:30"
      },
      "hint": {
        "timeOptional": "Optional: set a due time to enable reminders."
      },
      "repeatEveryDays": "Repeat every",
      "assignTo": "Who should do this?"
    },
    "needsApproval": "Needs approval",
    "active": "Active",
    "done": "Done",
    "review": "Review",
    "nextDue": "Next due",
    "action": {
      "doneAuto": "Done",
      "claim": "Claim",
      "requestDone": "Request done",
      "approve": "Approve",
      "reject": "Reject",
      "unclaim": "Unclaim",
      "illDoIt": "I'll do it",
      "leave": "Leave",
      "markDone": "Mark done",
      "notDone": "Not done",
      "accept": "Accept",
      "take": "Take"
    },
    "newPrompt": "What can you do today?",
    "when": "When?",
    "reminder": {
      "label": "Reminder",
      "requiresTime": "Set a time to enable reminders."
    },
    "selectedDate": "Selected date",
    "dateNotSet": "—",
    "repeatEveryPlaceholder": "Repeat every ___ days (numbers only)",
    "repeatDaysPlaceholder": "___",
    "dateInvalid": "Pick a valid date.",
    "timeInvalid": "Time must be HHMM (e.g. 1630).",
    "calendarMissing": "Calendar picker not installed. Enter DDMM; calendar is optional.",
    "assign": {
      "none": "Not assigned",
      "select": "Select",
      "selectCta": "Select",
      "clear": "Clear selection"
    },
    "assignTo": "Assign to",
    "repeat": {
      "autoHint": "Auto complete without approval",
      "autoOn": "Auto (no approval):  ON",
      "none": "Off",
      "auto": "Auto",
      "autoOff": "Auto (no approval):  OFF",
      "label": "Repeat",
      "days": "days"
    },
    "errors": {
      "saveFailed": "Save failed.",
      "deleteFailed": "Delete failed.",
      "actionFailed": "Action failed."
    },
    "datePlaceholder": "DDMM",
    "due": {
      "none": "No due time"
    },
    "calendar": "Calendar",
    "tomorrow": "Tomorrow",
    "today": "Today",
    "badge": {
      "open": "Open",
      "done": "Done"
    }
  },
  "today": {
    "title": "Today",
    "familyPrefix": "Family",
    "pills": {
      "total": "Total",
      "open": "Active",
      "done": "Done"
    },
    "anytime": "Any time",
    "morning": "Morning",
    "afternoon": "Afternoon",
    "evening": "Evening",
    "noTime": "No due time",
    "empty": {
      "title": "No tasks today",
      "subtitle": "Add tasks in Tasks and set due date for today.",
      "active": "Everything is done 🎉",
      "done": "No completed tasks today",
      "switch": "Change the filter above or add tasks in Tasks."
    }
  },
  "members": {
    "familyNameFallback": "My Family",
    "editHint": "To edit a member, tap ⋮ on their card.",
    "defaultChild": "Child",
    "role": {
      "parent": "Parent",
      "child": "Child",
      "mom": "Mom",
      "dad": "Dad"
    },
    "defaultParent": "Parent",
    "stats": {
      "kids": "Kids",
      "parents": "Parents",
      "done": "Done",
      "family": "Family"
    },
    "doneToday": "Done today",
    "listTitle": "Members list",
    "noMembers": "No members yet.",
    "changeOwnNameHint": "Change your own name in Settings → Profile.",
    "editMember": "Edit member",
    "hello": "Hello",
    "lastParentCantChangeRole": "You cannot change the role of the last parent. Add another parent first.",
    "lastParentCantRemove": "You cannot remove the last parent. Add another parent first.",
    "lastParentNotice": "This is the last parent, so you cannot change their role or remove them.",
    "memberFallback": "Member",
    "newNamePlaceholder": "New name",
    "noFamilyBody": "Join/create a family in Settings → Family.",
    "noFamilyTitle": "You are not in a family yet.",
    "overview": "Here's an overview of your family activities.",
    "removeBody": "Tasks remain, but the member is removed and any assignments to them are cleared.",
    "removeTitle": "Remove member?",
    "roleTitle": "Role",
    "parent": "Parent",
    "child": "Child",
    "editHintLongPress": "Tip: Long press a member to edit."
  },
  "auth": {
    "tagline": "Family tasks, simple",
    "title": "Sign in",
    "registerTitle": "Create account",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm password",
    "togglePassword": "Show or hide password",
    "placeholders": {
      "email": "email@example.com",
      "password": "••••••••",
      "confirmPassword": "••••••••"
    },
    "login": "Login",
    "register": "Register",
    "missingUid": "You are not signed in (member id missing).",
    "invalidEmail": "Enter a valid email.",
    "magicLinkSent": "Check your email for the sign-in link.",
    "magicLinkHelp": "We’ll email you a sign-in link.",
    "loginMagicLink": "Login (magic link)",
    "sendLink": "Send link",
    "logout": "Logout",
    "signedInAs": "Signed in as:",
    "deleteAccount": "Delete account",
    "deleteAccountWarning": "This permanently removes your account and all data."
  },
  "shopping": {
    "title": "Shopping",
    "subtitle": "Shared list for the whole family.",
    "addPlaceholder": "Add an item…",
    "addBtn": "Add",
    "toBuy": "To buy",
    "emptyTitle": "Nothing to buy",
    "emptyBody": "Add items using chips or the input above.",
    "noFamilyTitle": "Shopping",
    "noFamilyBody": "Join or create a family to use shared shopping list.",
    "errorTitle": "Shopping",
    "deleteTitle": "Delete item",
    "deleteBody": "Do you want to remove this item from the list?",
    "suggestedBy": "Suggested by",
    "me": "Me",
    "member": "Member",
    "chip": {
      "detergent": "Laundry detergent",
      "toiletPaper": "Toilet paper",
      "water": "Water",
      "milk": "Milk",
      "bread": "Bread",
      "eggs": "Eggs",
      "fruit": "Fruit",
      "vegetables": "Vegetables",
      "meat": "Meat",
      "cheese": "Cheese",
      "shampoo": "Shampoo",
      "dishSoap": "Dish soap"
    },
    "bought7d": "Bought (7 days)",
    "addedBy": "Added by",
    "addedAt": "Added",
    "bought": "Bought",
    "boughtWhen": "Bought",
    "boughtEmptyTitle": "No recent purchases",
    "boughtEmptyBody": "Items you mark as bought will appear here for 7 days.",
    "goShop": "Go shop",
    "sendTitle": "Send list",
    "sendPick": "Choose who is going shopping.",
    "sendEmpty": "The list is empty.",
    "sendHeader": "Who is going shopping?",
    "sendHint": "Send the whole list as one notification (no spam).",
    "sentTitle": "Sent",
    "sentBody": "Shopping list notification was sent."
  },
  "home": {
    "title": "Daily tasks",
    "subtitle": "Quick overview and focus",
    "plannerToday": "Planner — today",
    "tasksLatest": "Tasks — newest",
    "shopping": "Shopping",
    "shoppingCartCount": "You have {{count}} items in the cart",
    "viewMore": "View more",
    "noFamilyShopping": "Join or create a family to use the shared shopping list.",
    "noTime": "Any time",
    "shoppingEmpty": "Shopping list is empty",
  },


  "planner": {
    "title": "Planner",
    "subtitle": "Your simple daily plan (private or shared).",
    "selectedDay": "Selected",
    "hintPickDay": "Pick a day on the calendar, then tap + New",
    "newBtn": "+ New",
    "newTitle": "New plan",
    "editTitle": "Edit plan",
    "placeholder": {
      "title": "e.g. Doctor, pay bills, call grandma"
    },
    "timeLabel": "Time (optional)",
    "timePlaceholder": "HHMM (e.g. 1630)",
    "anytime": "Any",
    "for": "For",
    "shared": "Shared",
    "forWho": "For who?",
    "family": "Family",
    "someone": "Someone",
    "assigned": {
      "all": "Family",
      "some": "Selected"
    },
    "someHint": "Tip: pick one or more members. (Long-press items to delete)",
    "noFamilyHint": "Tip: join a family to share a plan with a member.",
    "noStorage": "Note: AsyncStorage is not installed, so plans will reset when the app reloads.",
    "calendarMissing": "Calendar component is not installed. If you want this month view, install react-native-calendars.",
    "emptyTitle": "No plans yet",
    "emptyBody": "Tap + New and add your first plan for this day.",
    "titleRequired": "Title is required.",
    "timeInvalid": "Time must be HH:MM (e.g. 1630).",
    "pickSomeone": "Choose at least one member.",
    "deleteConfirm": "Delete this item?"
  }
};

const hr = {
  tabs: {
    home: "Početna",
    members: "Članovi",
    tasks: "Zadaci",
    shopping: "Kupovina",
    planner: "Planer",
    settings: "Postavke",  },
  "onboarding": {
    "profile": {
      "title": "Postavi svoj profil",
      "subtitle": "Ovo pomaže obitelji da prepozna tko je tko.",
      "name": "Ime",
      "role": "Ti si",
      "gender": "Spol",
      "male": "Muško",
      "female": "Žensko",
      "autoAvatar": "Avatar će se postaviti automatski"
    },
    "family": {
      "title": "Pridruži se ili kreiraj obitelj",
      "subtitle": "Možeš se pridružiti kodom ili kreirati novu obitelj.",
      "joinTitle": "Pridruži se postojećoj obitelji",
      "joinSub": "Upiši obiteljski kod koji si dobio od roditelja.",
      "createTitle": "Kreiraj novu obitelj",
      "createSub": "Odaberi naziv obitelji i kasnije pozovi ostale."
    }
  },
  "common": {
    "loading": "Učitavam...",
    "ok": "U redu",
    "cancel": "Odustani",
    "save": "Spremi",
    "error": "Greška",
    "delete": "Obriši",
    "copied": "Kopirano.",
    "copyFailed": "Ne mogu kopirati.",
    "all": "Sve",
    "on": "Uklj",
    "off": "Isklj",
    "info": "Info",
    "me": "Ja",
    "remove": "Ukloni",
    "rename": "Preimenuj",
    "success": "Uspjeh",
    "back": "Natrag",
    "create": "Kreiraj",
    "join": "Pridruži se",
    "continue": "Nastavi",
    "male": "Muško",
    "female": "Žensko"

  },
  "settings": {
    "title": "Postavke",
    "subtitle": "Obitelj, jezik i profil",
    "setup": {
      "title": "Postavi račun",
      "step1": "1) Uđi u obitelj ili napravi novu",
      "step2": "2) Zatim postavi ime u Postavke → Obitelj",
      "whyName": "Tvoje ime se sprema kao član obitelji, pa postaje dostupno nakon što uđeš u obitelj.",
      "next": "Sljedeći korak",
      "setNameNow": "Postavi svoje ime kako bi te drugi mogli prepoznati."
    },
    "language": "Jezik",
    "languageHint": "Odaberi jezik sučelja.",
    "languageNote": "Ova promjena vrijedi za cijelu aplikaciju.",
    "croatian": "Hrvatski",
    "english": "Engleski",
    "italian": "Talijanski",
    "slovenian": "Slovenski",
    "french": "Francuski",
    "german": "Njemački",
    "spanish": "Španjolski",
    "serbian": "Srpski",
    "myName": "Moje ime",
    "myNamePlaceholder": "Ime",
    "nameRequired": "Upiši ime.",
    "saved": "Spremljeno.",
    "family": {
      "notInFamily": "Nisi u obitelji.",
      "statusLine": "Obitelj: {{name}} (Poziv: {{code}})",
      "title": "Obitelj",
      "notInFamilyTitle": "Još nema obitelji"
    },
    "about": "O aplikaciji",
    "account": "Račun",
    "aboutLine": "Obiteljska aplikacija za zadatke i organizaciju.",
    "version": "Verzija",
    "family_not_in_family": "Nisi u obitelji.",
    "btn": {
      "changeLanguage": "Promijeni jezik ({{lang}})",
      "editName": "Uredi ime",
      "copy": "Kopiraj",
      "renameFamily": "Preimenuj",
      "setName": "Postavi ime",
      "leaveFamily": "Napusti obitelj",
      "deleteFamily": "Obriši obitelj",
      "showInviteCode": "Prikaži pozivni kod",
      "hideInviteCode": "Sakrij pozivni kod",
      "createFamily": "Napravi obitelj",
      "joinFamily": "Uđi u obitelj",
      "join": "Pridruži se"
    },
    "msg": {
      "familyRenamed": "Naziv obitelji ažuriran."
    },
    "renameFamilyTitle": "Promijeni naziv obitelji",
    "renameFamilyPlaceholder": "Naziv obitelji",
    "labels": {
      "family": "Obitelj",
      "inviteCode": "Pozivni kod",
      "myName": "Tvoje ime"
    },
    "notSet": "Nije postavljeno",
    "nameAfterJoin": "Uđi ili napravi obitelj da postaviš ime.",
    "deleteFamily": {
      "help": "Obitelj možeš obrisati samo ako si jedini član.",
      "title": "Obriši obitelj",
      "body": "Ovo će trajno obrisati obitelj i sve podatke.",
      "confirm": "Upiši DELETE za potvrdu.",
      "deleted": "Obitelj je obrisana."
    },
    "joinFamily": {
      "help": "Upiši pozivni kod od člana obitelji.",
      "title": "Pridruži se obitelji",
      "placeholder": "Pozivni kod",
      "invalidCode": "Upiši pozivni kod.",
      "joined": "Sada si u obitelji."
    },
    "createFamily": {
      "title": "Kreiraj obitelj",
      "desc": "Kreiraj novu obitelj i počni dijeliti zadatke.",
      "placeholder": "Naziv obitelji",
      "nameRequired": "Naziv obitelji je obavezan.",
      "created": "Obitelj je kreirana."
    },
    "leaveFamily": {
      "title": "Napusti obitelj",
      "body": "Jesi li siguran/na da želiš napustiti obitelj?",
      "confirm": "Napusti",
      "left": "Napustio/la si obitelj."
    },
    "myProfile": "Moj profil"
  },
  "tasks": {
    "status": {
      "open": "Otvoren",
      "claimed": "Preuzet",
      "review": "Za potvrdu",
      "done": "Gotovo"
    },
    "filter": {
      "all": "Sve",
      "active": "Aktivno",
      "review": "Za potvrdu",
      "done": "Gotovo"
    },
    "timelineHint": {
      "assigned": "Dodijeljeno → Gotovo → Odobreno",
      "created": "Kreirano → Gotovo → Odobreno"
    },
    "hideDoneOn": "Sakrij gotovo: UKLJ",
    "hideDoneOff": "Sakrij gotovo: ISKLJ",
    "emptyTitle": "Nema zadataka",
    "emptySubtitle": "Kreiraj prvi zadatak s + Novi",
    "actionsTitle": "Radnje zadatka",
    "edit": "Uredi",
    "editTitle": "Uredi zadatak",
    "newTitle": "Novi zadatak",
    "titlePlaceholder": "npr. Pokupi djecu",
    "timePlaceholder": "Upiši (HHMM) npr. 1630",
    "assignedTo": "Dodijeljeno osobi",
    "noAssignee": "Svi",
    "titleRequired": "Naslov je obavezan.",
    "deleteConfirm": "Obrisati ovaj zadatak?",
    "claim": "Preuzmi",
    "unclaim": "Vrati",
    "requestDone": "Traži potvrdu",
    "approve": "Odobri",
    "reject": "Odbij",
    "reset": "Resetiraj",
    "title": "Zadaci",
    "heroSub": "Brzi filteri i pregled",
    "newBtn": "+ Novi",
    "new": {
      "title": "Kreiraj novi zadatak za člana obitelji",
      "placeholder": {
        "title": "npr. Odvedi Luku na trening",
        "time": "npr. 16:30"
      },
      "hint": {
        "timeOptional": "Kada zadatak treba biti obavljen."
      },
      "repeatEveryDays": "Ponavljaj svakih",
      "assignTo": "Tko to radi?"
    },
    "needsApproval": "Za potvrdu",
    "active": "Aktivno",
    "done": "Gotovo",
    "review": "Za potvrdu",
    "nextDue": "Sljedeći termin",
    "action": {
      "doneAuto": "Obavljeno",
      "claim": "Preuzmi",
      "requestDone": "Za potvrdu",
      "approve": "Odobri",
      "reject": "Odbij",
      "unclaim": "Vrati",
      "illDoIt": "Ja ću",
      "leave": "Odustani",
      "markDone": "Označi gotovo",
      "notDone": "Nije gotovo",
      "accept": "Prihvati",
      "take": "Preuzmi"
    },
    "newPrompt": "Što možeš danas napraviti?",
    "when": "Kada?",
    "reminder": {
      "label": "Podsjetnik",
      "requiresTime": "Postavi vrijeme da uključiš podsjetnike."
    },
    "selectedDate": "Odabrani datum",
    "dateNotSet": "—",
    "repeatEveryPlaceholder": "Ponavljaj svakih ___ dana (samo broj)",
    "repeatDaysPlaceholder": "___",
    "dateInvalid": "Odaberi ispravan datum.",
    "timeInvalid": "Vrijeme mora biti HHMM (npr. 1630).",
    "calendarMissing": "Kalendar nije instaliran. Unesi DDMM; kalendar je opcionalan.",
    "calendar": "Kalendar",
    "datePlaceholder": "Odaberi datum",
    "due": {
      "none": "Bez roka"
    },
    "errors": {
      "actionFailed": "Radnja nije uspjela.",
      "deleteFailed": "Brisanje nije uspjelo.",
      "saveFailed": "Spremanje nije uspjelo."
    },
    "repeat": {
      "auto": "Auto",
      "autoHint": "Automatski završi bez potvrde",
      "autoOff": "Isključeno",
      "autoOn": "Uključeno",
      "none": "Ne ponavljaj",
      "label": "Ponavljanje",
      "days": "dana"
    },
    "today": "Danas",
    "tomorrow": "Sutra",
    "assignTo": "Dodijeli",
    "assign": {
      "none": "Nije dodijeljeno",
      "select": "Odaberi",
      "selectCta": "Odaberi",
      "clear": "Očisti odabir"
    },
    "badge": {
      "open": "Otvoreno",
      "done": "Gotovo"
    }
  },
  "today": {
    "title": "Danas",
    "familyPrefix": "Obitelj",
    "pills": {
      "total": "Ukupno",
      "open": "Aktivno",
      "done": "Gotovo"
    },
    "anytime": "Bilo kada",
    "morning": "Prijepodne",
    "afternoon": "Popodne",
    "evening": "Večer",
    "noTime": "Bez roka",
    "empty": {
      "title": "Danas nema zadataka",
      "subtitle": "Dodaj zadatke u Tasks i postavi rok za danas.",
      "active": "Sve je riješeno za danas 🎉",
      "done": "Nema gotovih zadataka danas",
      "switch": "Promijeni filter gore ili dodaj nove zadatke u Tasks."
    }
  },
  "members": {
    "familyNameFallback": "Moja obitelj",
    "editHint": "Za uređivanje člana, dodirni ⋮ na njegovoj kartici.",
    "filter": {
      "all": "Sve",
      "kids": "Djeca",
      "parents": "Roditelji",
      "parent": "Roditelj",
      "child": "Dijete"
    },
    "kids": "Djeca",
    "listTitle": "Popis članova",
    "noMembers": "Još nema članova.",
    "parents": "Roditelji",
    "stats": {
      "parents": "Roditelji",
      "kids": "Djeca",
      "todayDone": "Danas riješeno",
      "done": "Gotovo",
      "family": "Obitelj"
    },
    "defaultParent": "Roditelj",
    "defaultChild": "Dijete",
    "role": {
      "parent": "Roditelj",
      "child": "Dijete",
      "mom": "Mama",
      "dad": "Tata"
    },
    "doneToday": "Danas riješeno",
    "changeOwnNameHint": "Promijeni svoje ime u Postavke → Profil.",
    "editMember": "Uredi člana",
    "hello": "Bok",
    "lastParentCantChangeRole": "Ne možeš promijeniti ulogu posljednjeg roditelja. Prvo dodaj još jednog roditelja.",
    "lastParentCantRemove": "Ne možeš ukloniti posljednjeg roditelja. Prvo dodaj još jednog roditelja.",
    "lastParentNotice": "Ovo je posljednji roditelj, zato mu ne možeš promijeniti ulogu niti ga ukloniti.",
    "memberFallback": "Član",
    "newNamePlaceholder": "Novo ime",
    "noFamilyBody": "Pridruži se/kreiraj obitelj u Postavke → Obitelj.",
    "noFamilyTitle": "Još nisi u obitelji.",
    "overview": "Evo pregleda obiteljskih aktivnosti.",
    "removeBody": "Zadaci ostaju, ali član se uklanja i sve dodjele njemu se brišu.",
    "removeTitle": "Ukloniti člana?",
    "roleTitle": "Uloga",
    "parent": "Roditelj",
    "child": "Dijete",
    "editHintLongPress": "Savjet: Dugo pritisni člana za uređivanje."
  },
  "auth": {
    "tagline": "Obiteljski zadaci, jednostavno",
    "title": "Prijava",
    "registerTitle": "Izradi račun",
    "email": "Email",
    "password": "Lozinka",
    "confirmPassword": "Potvrdi lozinku",
    "togglePassword": "Prikaži ili sakrij lozinku",
    "placeholders": {
      "email": "ime@email.com",
      "password": "••••••••",
      "confirmPassword": "••••••••"
    },
    "login": "Prijava",
    "register": "Registracija",
    "passwordLoginBtn": "Prijavi se",
    "registerBtn": "Izradi račun",
    "forgotPasswordBtn": "Zaboravljena lozinka?",
    "sendMagicLinkBtn": "Pošalji magic link",
    "noAccount": "Nemaš račun?",
    "createAccount": "Izradi ga",
    "haveAccount": "Već imaš račun?",
    "backToLogin": "Prijava",
    "alerts": {
      "missingEmailPasswordBody": "Upiši email i lozinku.",
      "missingEmailBody": "Upiši svoj email.",
      "missingRegisterBody": "Upiši email i oba polja lozinke.",
      "weakPasswordBody": "Lozinka mora imati barem 6 znakova.",
      "passwordMismatchBody": "Lozinke se ne podudaraju.",
      "loginErrorTitle": "Greška pri prijavi",
      "resetSentBody": "Poslali smo ti email s linkom za postavljanje nove lozinke.",
      "resetErrorTitle": "Greška pri resetu",
      "magicLinkSentBody": "Poslali smo magic link na tvoj email.",
      "magicLinkErrorTitle": "Greška magic linka",
      "registerConfirmEmailBody": "Račun je izrađen. Potvrdi email preko linka koji smo poslali, pa se prijavi.",
      "registerOkBody": "Račun je izrađen. Sada se možeš prijaviti.",
      "registerErrorTitle": "Greška pri registraciji"
    },
    "missingUid": "Nisi prijavljen (nedostaje ID člana).",
    "invalidEmail": "Upiši ispravan email.",
    "magicLinkSent": "Provjeri email za link za prijavu.",
    "magicLinkHelp": "Poslat ćemo ti link za prijavu na email.",
    "loginMagicLink": "Prijava (magic link)",
    "sendLink": "Pošalji link",
    "logout": "Odjava",
    "signedInAs": "Prijavljen kao:",
    "deleteAccount": "Obriši račun",
    "deleteAccountWarning": "Ova radnja trajno briše tvoj račun i sve podatke."
  },
  "shopping": {
    "title": "Kupovina",
    "subtitle": "Zajednička lista za cijelu obitelj.",
    "addPlaceholder": "Dodaj stavku…",
    "addBtn": "Dodaj",
    "toBuy": "Za kupiti",
    "emptyTitle": "Nema ništa za kupiti",
    "emptyBody": "Dodaj stavke pomoću prijedloga ili unosa iznad.",
    "noFamilyTitle": "Kupovina",
    "noFamilyBody": "Pridruži se ili napravi obitelj kako bi koristio zajedničku listu.",
    "errorTitle": "Kupovina",
    "deleteTitle": "Obriši stavku",
    "deleteBody": "Želiš li ukloniti ovu stavku s liste?",
    "suggestedBy": "Predložio/la",
    "me": "Ja",
    "member": "Član",
    "chip": {
      "detergent": "Prašak za rublje",
      "toiletPaper": "Toaletni papir",
      "water": "Voda",
      "milk": "Mlijeko",
      "bread": "Kruh",
      "eggs": "Jaja",
      "fruit": "Voće",
      "vegetables": "Povrće",
      "meat": "Meso",
      "cheese": "Sir",
      "shampoo": "Šampon",
      "dishSoap": "Deterdžent za suđe"
    },
    "bought7d": "Kupljeno (7 dana)",
    "addedBy": "Dodao",
    "addedAt": "Dodano",
    "bought": "Kupljeno",
    "boughtWhen": "Kupljeno",
    "boughtEmptyTitle": "Nema nedavnih kupnji",
    "boughtEmptyBody": "Stavke koje označiš kao kupljene bit će ovdje vidljive 7 dana.",
    "goShop": "Kreni u kupnju",
    "sendTitle": "Pošalji popis",
    "sendPick": "Odaberi tko ide u kupnju.",
    "sendEmpty": "Popis je prazan.",
    "sendHeader": "Tko ide u kupnju?",
    "sendHint": "Pošalji cijeli popis kao jednu notifikaciju (bez spama).",
    "sentTitle": "Poslano",
    "sentBody": "Notifikacija s popisom za kupnju je poslana."
  },
  "home": {
    "title": "Dnevne obaveze",
    "subtitle": "Brzi pregled i fokus",
    "plannerToday": "Planer — danas",
    "tasksLatest": "Zadaci — najnoviji",
    "shopping": "Kupovina",
    "shoppingCartCount": "Imaš {{count}} stavki u košarici",
    "viewMore": "Vidi više",
    "noFamilyShopping": "Pridruži se ili kreiraj obitelj za zajedničku listu kupovine.",
    "noTime": "Bilo kada",
    "shoppingEmpty": "Lista kupovine je prazna",
plannerEmptyMe: "Danas nema planova",
  plannerEmptyKids: "Nema planova za djecu",
  plannerEmptyFamily: "Danas nema planova",

  plannerEmptyFamilySub: "Isplaniraj jednu sitnicu ✨",
  plannerEmptySub: "Sve je mirno 🙂",

  tasksEmptyMe: "Nema zadataka za tebe",
  tasksEmptyKids: "Djeca nemaju zadataka",
  tasksEmptyFamily: "Nema otvorenih zadataka",

  tasksEmptySub: "Sve je čisto. Neka tako i ostane 😄",
  },


  "planner": {
    "title": "Planer",
    "subtitle": "Tvoj jednostavan dnevni plan (privatno ili dijeljeno).",
    "selectedDay": "Odabrano",
    "hintPickDay": "Odaberi dan na kalendaru, zatim dodirni + Novo",
    "newBtn": "+ Novo",
    "newTitle": "Novi plan",
    "editTitle": "Uredi plan",
    "placeholder": {
      "title": "npr. doktor, platiti račune, nazvati baku"
    },
    "timeLabel": "Vrijeme (opcionalno)",
    "timePlaceholder": "HHMM (npr. 1630)",
    "anytime": "Bilo kad",
    "for": "Za",
    "shared": "Dijeljeno",
    "forWho": "Za koga?",
    "family": "Obitelj",
    "someone": "Netko",
    "assigned": {
      "all": "Obitelj",
      "some": "Odabrano"
    },
    "someHint": "Savjet: odaberi jednog ili više članova. (Dugi pritisak briše)",
    "noFamilyHint": "Savjet: pridruži se obitelji kako bi dijelio plan s članom.",
    "noStorage": "Napomena: AsyncStorage nije instaliran pa će se planovi resetirati kad se aplikacija ponovno učita.",
    "calendarMissing": "Komponenta kalendara nije instalirana. Ako želiš mjesečni prikaz, instaliraj react-native-calendars.",
    "emptyTitle": "Još nema planova",
    "emptyBody": "Dodirni + Novo i dodaj prvi plan za ovaj dan.",
    "titleRequired": "Naslov je obavezan.",
    "timeInvalid": "Vrijeme mora biti HH:MM (npr. 1630).",
    "pickSomeone": "Odaberi barem jednog člana.",
    "deleteConfirm": "Obrisati ovu stavku?"
  }
};

const it = {
  "tabs": {
    "home": "Oggi",
    "members": "Membri",
    "tasks": "Attività",
    "shopping": "Spesa",
    "settings": "Impostazioni"
  },
  "onboarding": {
    "profile": {
      "title": "Configura il tuo profilo",
      "subtitle": "Questo aiuta la famiglia a riconoscere chi è chi.",
      "name": "Il tuo nome",
      "role": "Tu sei",
      "gender": "Genere",
      "male": "Maschio",
      "female": "Femmina",
      "autoAvatar": "L'avatar verrà impostato automaticamente"
    },
    "family": {
      "title": "Unisciti o crea una famiglia",
      "subtitle": "Puoi unirti con un codice o creare una nuova famiglia.",
      "joinTitle": "Unisciti a una famiglia esistente",
      "joinSub": "Inserisci il codice famiglia che hai ricevuto da un genitore.",
      "createTitle": "Crea una nuova famiglia",
      "createSub": "Scegli un nome per la famiglia e invita altri più tardi."
    }
  },
  "common": {
    "loading": "Caricamento...",
    "ok": "OK",
    "cancel": "Annulla",
    "save": "Salva",
    "error": "Errore",
    "delete": "Elimina",
    "copied": "Copiato.",
    "copyFailed": "Impossibile copiare.",
    "all": "Tutti",
    "on": "On",
    "off": "Off",
    "info": "Info",
    "me": "Io",
    "remove": "Rimuovi",
    "rename": "Rinomina",
    "success": "Successo",
    "male": "Maschio",
    "female": "Femmina",
    "back": "Indietro",
    "continue": "Continua",
    "create": "Crea",
    "join": "Unisciti"
  },
  "settings": {
    "title": "Impostazioni",
    "subtitle": "Famiglia, lingua e profilo",
    "setup": {
      "title": "Configura il tuo account",
      "step1": "1) Unisciti o crea una famiglia",
      "step2": "2) Poi imposta il tuo nome in Impostazioni → Famiglia",
      "whyName": "Il tuo nome viene salvato come membro della famiglia e diventa disponibile dopo l’adesione.",
      "next": "Prossimo passo",
      "setNameNow": "Imposta il tuo nome così gli altri possono riconoscerti."
    },
    "language": "Lingua",
    "languageHint": "Scegli la lingua dell’interfaccia.",
    "languageNote": "Questa modifica vale per tutta l’app.",
    "croatian": "Croato",
    "english": "Inglese",
    "italian": "Italiano",
    "slovenian": "Sloveno",
    "french": "Francese",
    "german": "Tedesco",
    "spanish": "Spagnolo",
    "serbian": "Serbo",
    "family": {
      "notInFamily": "Non sei in una famiglia.",
      "statusLine": "Famiglia: {{name}} (Invito: {{code}})",
      "title": "Famiglia",
      "notInFamilyTitle": "Nessuna famiglia"
    },
    "about": "Info",
    "account": "Account",
    "aboutLine": "App familiare per attività e organizzazione.",
    "version": "Versione",
    "family_not_in_family": "Non sei in una famiglia.",
    "btn": {
      "changeLanguage": "Cambia lingua ({{lang}})",
      "editName": "Modifica nome",
      "copy": "Copia",
      "renameFamily": "Rinomina",
      "setName": "Imposta il nome",
      "leaveFamily": "Lascia la famiglia",
      "deleteFamily": "Elimina la famiglia",
      "showInviteCode": "Mostra codice invito",
      "hideInviteCode": "Nascondi codice invito",
      "createFamily": "Crea famiglia",
      "joinFamily": "Unisciti alla famiglia",
      "join": "Unisciti"
    },
    "msg": {
      "familyRenamed": "Nome famiglia aggiornato."
    },
    "renameFamilyTitle": "Rinomina famiglia",
    "renameFamilyPlaceholder": "Nome famiglia",
    "myName": "Il mio nome",
    "myNamePlaceholder": "Nome",
    "nameRequired": "Inserisci un nome.",
    "saved": "Salvato.",
    "labels": {
      "family": "Famiglia",
      "inviteCode": "Codice invito",
      "myName": "Il tuo nome"
    },
    "notSet": "Non impostato",
    "nameAfterJoin": "Unisciti o crea una famiglia per impostare il nome.",
    "deleteFamily": {
      "help": "Puoi eliminare la famiglia solo quando sei l’unico membro.",
      "title": "Elimina famiglia",
      "body": "Questo eliminerà definitivamente la famiglia e tutti i dati.",
      "confirm": "Digita DELETE per confermare.",
      "deleted": "Famiglia eliminata."
    },
    "joinFamily": {
      "help": "Inserisci un codice invito di un membro della famiglia.",
      "title": "Unisciti alla famiglia",
      "placeholder": "Codice invito",
      "invalidCode": "Inserisci il codice invito.",
      "joined": "Ora fai parte della famiglia."
    },
    "createFamily": {
      "title": "Crea famiglia",
      "desc": "Crea una nuova famiglia per iniziare a condividere le attività.",
      "placeholder": "Nome della famiglia",
      "nameRequired": "Il nome della famiglia è obbligatorio.",
      "created": "Famiglia creata."
    },
    "leaveFamily": {
      "title": "Lascia la famiglia",
      "body": "Sei sicuro/a di voler lasciare la famiglia?",
      "confirm": "Lascia",
      "left": "Hai lasciato la famiglia."
    },
    "myProfile": "Il mio profilo"
  },
  "tasks": {
    "status": {
      "open": "Aperto",
      "claimed": "Preso",
      "review": "Da approvare",
      "done": "Fatto"
    },
    "filter": {
      "all": "Tutti",
      "active": "Attivi",
      "review": "Da approvare",
      "done": "Fatti"
    },
    "timelineHint": {
      "assigned": "Assegnato → Fatto → Approvato",
      "created": "Creato → Fatto → Approvato"
    },
    "hideDoneOn": "Nascondi fatti: ON",
    "hideDoneOff": "Nascondi fatti: OFF",
    "emptyTitle": "Nessuna attività",
    "emptySubtitle": "Crea la prima attività con + Nuova",
    "actionsTitle": "Azioni attività",
    "edit": "Modifica",
    "editTitle": "Modifica attività",
    "newTitle": "Nuova attività",
    "titlePlaceholder": "es. Prendi i bambini",
    "timePlaceholder": "Scrivi (HHMM) es. 1630",
    "assignedTo": "Assegna a",
    "noAssignee": "Tutti",
    "titleRequired": "Il titolo è obbligatorio.",
    "deleteConfirm": "Eliminare questa attività?",
    "claim": "Prendi",
    "unclaim": "Rilascia",
    "requestDone": "Richiedi conferma",
    "approve": "Approva",
    "reject": "Rifiuta",
    "reset": "Reimposta",
    "calendar": "Calendario",
    "datePlaceholder": "Seleziona una data",
    "due": {
      "none": "Senza scadenza"
    },
    "errors": {
      "actionFailed": "Operazione non riuscita.",
      "deleteFailed": "Eliminazione non riuscita.",
      "saveFailed": "Salvataggio non riuscito."
    },
    "repeat": {
      "auto": "Auto",
      "autoHint": "Completa automaticamente senza approvazione",
      "autoOff": "Disattivato",
      "autoOn": "Attivato",
      "days": "giorni",
      "none": "Non ripetere",
      "label": "Ripeti"
    },
    "today": "Oggi",
    "tomorrow": "Domani",
    "assignTo": "Assegna a",
    "assign": {
      "none": "Non assegnato",
      "select": "Seleziona",
      "selectCta": "Seleziona",
      "clear": "Cancella selezione"
    },
    "title": "Compiti",
    "heroSub": "Filtri rapidi e panoramica",
    "newBtn": "+ Nuovo",
    "new": {
      "title": "Crea una nuova attività per un membro della famiglia",
      "placeholder": {
        "title": "es. Porta Luca all’allenamento",
        "time": "es. 16:30"
      },
      "hint": {
        "timeOptional": "Opzionale: imposta un orario per attivare i promemoria."
      },
      "repeatEveryDays": "Ripeti ogni",
      "assignTo": "Chi deve farlo?"
    },
    "newPrompt": "Cosa puoi fare oggi?",
    "when": "Quando?",
    "reminder": {
      "label": "Promemoria",
      "requiresTime": "Imposta un orario per attivare i promemoria."
    },
    "needsApproval": "Da approvare",
    "nextDue": "Prossima scadenza",
    "action": {
      "claim": "Prendi",
      "unclaim": "Rilascia",
      "requestDone": "Richiedi completamento",
      "approve": "Approva",
      "reject": "Rifiuta",
      "doneAuto": "Fatto",
      "illDoIt": "Lo faccio io",
      "leave": "Esci",
      "markDone": "Segna come fatto",
      "notDone": "Non fatto",
      "accept": "Accetta",
      "take": "Prendi"
    },
    "repeatEveryPlaceholder": "Ripeti ogni ___ giorni (solo numeri)",
    "repeatDaysPlaceholder": "___",
    "dateInvalid": "Scegli una data valida.",
    "timeInvalid": "L'ora deve essere HHMM (es. 1630).",
    "calendarMissing": "Selettore calendario non installato. Inserisci GGMM; il calendario è opzionale.",
    "active": "Attive",
    "done": "Fatte",
    "review": "Da approvare",
    "selectedDate": "Data selezionata",
    "dateNotSet": "—",
    "badge": {
      "open": "Aperto",
      "done": "Fatto"
    }
  },
  "today": {
    "title": "Oggi",
    "familyPrefix": "Famiglia",
    "pills": {
      "total": "Totale",
      "open": "Attive",
      "done": "Fatte"
    },
    "anytime": "Qualsiasi ora",
    "morning": "Mattina",
    "afternoon": "Pomeriggio",
    "evening": "Sera",
    "noTime": "Senza scadenza",
    "empty": {
      "title": "Nessuna attività oggi",
      "subtitle": "Aggiungi attività in Attività e imposta la scadenza per oggi.",
      "active": "Tutto fatto 🎉",
      "done": "Nessuna attività completata oggi",
      "switch": "Cambia il filtro sopra o aggiungi attività in Attività."
    }
  },
  "members": {
    "familyNameFallback": "La mia famiglia",
    "editHint": "Per modificare un membro, tocca ⋮ sulla sua scheda.",
    "filter": {
      "all": "Tutti",
      "kids": "Bambini",
      "parents": "Genitori"
    },
    "kids": "Bambini",
    "listTitle": "Elenco membri",
    "noMembers": "Nessun membro per ora.",
    "parents": "Genitori",
    "stats": {
      "parents": "Genitori",
      "kids": "Bambini",
      "todayDone": "Oggi completati",
      "done": "Fatto",
      "family": "Tutti i compiti di famiglia"
    },
    "defaultParent": "Genitore",
    "defaultChild": "Bambino",
    "role": {
      "parent": "Genitore",
      "child": "Bambino",
      "mom": "Mamma",
      "dad": "Papà"
    },
    "doneToday": "Fatto oggi",
    "changeOwnNameHint": "Cambia il tuo nome in Impostazioni → Profilo.",
    "editMember": "Modifica membro",
    "hello": "Ciao",
    "lastParentCantChangeRole": "Non puoi cambiare il ruolo dell’ultimo genitore. Aggiungi prima un altro genitore.",
    "lastParentCantRemove": "Non puoi rimuovere l’ultimo genitore. Aggiungi prima un altro genitore.",
    "lastParentNotice": "Questo è l’ultimo genitore, quindi non puoi cambiare il suo ruolo né rimuoverlo.",
    "memberFallback": "Membro",
    "newNamePlaceholder": "Nuovo nome",
    "noFamilyBody": "Unisciti/crea una famiglia in Impostazioni → Famiglia.",
    "noFamilyTitle": "Non sei ancora in una famiglia.",
    "overview": "Ecco una panoramica delle attività della tua famiglia.",
    "removeBody": "Le attività rimangono, ma il membro viene rimosso e tutte le assegnazioni a lui vengono cancellate.",
    "removeTitle": "Rimuovere il membro?",
    "roleTitle": "Ruolo",
    "parent": "Genitore",
    "child": "Bambino",
    "editHintLongPress": "Suggerimento: tieni premuto su un membro per modificare."
  },
  "auth": {
    "tagline": "Attività di famiglia, semplificate",
    "title": "Accedi",
    "registerTitle": "Crea account",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Conferma password",
    "togglePassword": "Mostra o nascondi password",
    "placeholders": {
      "email": "nome@email.com",
      "password": "••••••••",
      "confirmPassword": "••••••••"
    },
    "passwordLoginBtn": "Accedi",
    "registerBtn": "Crea account",
    "forgotPasswordBtn": "Password dimenticata?",
    "sendMagicLinkBtn": "Invia magic link",
    "noAccount": "Non hai un account?",
    "createAccount": "Creane uno",
    "haveAccount": "Hai già un account?",
    "backToLogin": "Accedi",
    "alerts": {
      "missingEmailPasswordBody": "Inserisci email e password.",
      "missingEmailBody": "Inserisci la tua email.",
      "missingRegisterBody": "Inserisci email e entrambe le password.",
      "weakPasswordBody": "La password deve avere almeno 6 caratteri.",
      "passwordMismatchBody": "Le password non coincidono.",
      "loginErrorTitle": "Errore di accesso",
      "resetSentBody": "Ti abbiamo inviato un’email con un link per impostare una nuova password.",
      "resetErrorTitle": "Errore di reset",
      "magicLinkSentBody": "Magic link inviato alla tua email.",
      "magicLinkErrorTitle": "Errore magic link",
      "registerConfirmEmailBody": "Account creato. Conferma l’indirizzo email tramite il link inviato, poi accedi.",
      "registerOkBody": "Account creato. Ora puoi accedere.",
      "registerErrorTitle": "Errore di registrazione"
    },
    "missingUid": "Non hai effettuato l’accesso (ID membro mancante).",
    "invalidEmail": "Inserisci un’email valida.",
    "magicLinkSent": "Controlla l’email per il link di accesso.",
    "magicLinkHelp": "Ti invieremo un link di accesso via email.",
    "loginMagicLink": "Accesso (magic link)",
    "sendLink": "Invia link",
    "logout": "Esci",
    "signedInAs": "Accesso come:"
  },
  "shopping": {
    "addBtn": "Aggiungi",
    "addPlaceholder": "Aggiungi un elemento…",
    "deleteBody": "Vuoi rimuovere questo elemento dalla lista?",
    "deleteTitle": "Elimina elemento",
    "emptyBody": "Aggiungi elementi usando il campo sopra.",
    "emptyTitle": "Niente da comprare",
    "errorTitle": "Spesa",
    "me": "Io",
    "member": "Membro",
    "noFamilyBody": "Unisciti o crea una famiglia per usare la lista della spesa condivisa.",
    "noFamilyTitle": "Spesa",
    "subtitle": "Lista condivisa per tutta la famiglia.",
    "suggestedBy": "Suggerito da",
    "toBuy": "Da comprare",
    "title": "Spesa",
    "goShop": "Vai a fare la spesa",
    "sendTitle": "Invia lista",
    "sendPick": "Scegli chi va a fare la spesa.",
    "sendEmpty": "La lista è vuota.",
    "sendHeader": "Chi va a fare la spesa?",
    "sendHint": "Invia l’intera lista come un’unica notifica (senza spam).",
    "sentTitle": "Inviato",
    "sentBody": "La notifica della lista della spesa è stata inviata.",
    "addedAt": "Aggiunto",
    "addedBy": "Aggiunto da",
    "bought": "Comprato",
    "bought7d": "Comprati (7 giorni)",
    "boughtEmptyTitle": "Nessun acquisto recente",
    "boughtEmptyBody": "Gli articoli che segni come acquistati appariranno qui per 7 giorni.",
    "boughtWhen": "Acquistato",
    "chip": {
      "bread": "Pane",
      "cheese": "Formaggio",
      "detergent": "Detersivo per bucato",
      "dishSoap": "Detersivo per piatti",
      "eggs": "Uova",
      "fruit": "Frutta",
      "meat": "Carne",
      "milk": "Latte",
      "shampoo": "Shampoo",
      "toiletPaper": "Carta igienica",
      "vegetables": "Verdura",
      "water": "Acqua"
    }
  },
  "home": {
    "title": "Attività quotidiane",
    "subtitle": "Panoramica rapida e focus",
    "plannerToday": "Planner — oggi",
    "tasksLatest": "Attività — più recenti",
    "shopping": "Spesa",
    "shoppingCartCount": "Hai {{count}} articoli nel carrello",
    "viewMore": "Vedi altro",
    "noFamilyShopping": "Unisciti o crea una famiglia per usare la lista della spesa condivisa.",
    "noTime": "In qualsiasi momento",
    "shoppingEmpty": "La lista della spesa è vuota",
  },

  "planner": {
    "title": "Planner",
    "subtitle": "Il tuo piano giornaliero semplice (privato o condiviso).",
    "selectedDay": "Selezionato",
    "hintPickDay": "Scegli un giorno nel calendario, poi tocca + Nuovo",
    "newBtn": "+ Nuovo",
    "newTitle": "Nuovo piano",
    "editTitle": "Modifica piano",
    "placeholder": {
      "title": "es. medico, pagare le bollette, chiamare la nonna"
    },
    "timeLabel": "Orario (opzionale)",
    "timePlaceholder": "HHMM (es. 1630)",
    "anytime": "Qualsiasi",
    "for": "Per",
    "shared": "Condiviso",
    "forWho": "Per chi?",
    "family": "Famiglia",
    "someone": "Qualcuno",
    "assigned": {
      "all": "Famiglia",
      "some": "Selezionati"
    },
    "someHint": "Suggerimento: seleziona uno o più membri. (Pressione lunga per eliminare)",
    "noFamilyHint": "Suggerimento: unisciti a una famiglia per condividere un piano con un membro.",
    "noStorage": "Nota: AsyncStorage non è installato, quindi i piani verranno azzerati al riavvio dell'app.",
    "calendarMissing": "Il componente calendario non è installato. Se vuoi la vista mensile, installa react-native-calendars.",
    "emptyTitle": "Nessun piano ancora",
    "emptyBody": "Tocca + Nuovo e aggiungi il primo piano per questo giorno.",
    "titleRequired": "Il titolo è obbligatorio.",
    "timeInvalid": "L'orario deve essere HH:MM (es. 1630).",
    "pickSomeone": "Scegli almeno un membro.",
    "deleteConfirm": "Eliminare questo elemento?"
  }
};

const sl = {
  "tabs": {
    "home": "Danes",
    "members": "Člani",
    "tasks": "Opravila",
    "shopping": "Nakupovanje",
    "settings": "Nastavitve"
  },
  "onboarding": {
    "profile": {
      "title": "Nastavi svoj profil",
      "subtitle": "To pomaga družini prepoznati, kdo je kdo.",
      "name": "Tvoje ime",
      "role": "Ti si",
      "gender": "Spol",
      "male": "Moški",
      "female": "Ženska",
      "autoAvatar": "Avatar bo nastavljen samodejno"
    },
    "family": {
      "title": "Pridruži se ali ustvari družino",
      "subtitle": "Lahko se pridružiš s kodo ali ustvariš novo družino.",
      "joinTitle": "Pridruži se obstoječi družini",
      "joinSub": "Vnesi družinsko kodo, ki si jo dobil/a od starša.",
      "createTitle": "Ustvari novo družino",
      "createSub": "Izberi ime družine in kasneje povabi druge."
    }
  },
  "common": {
    "loading": "Nalaganje...",
    "ok": "V redu",
    "cancel": "Prekliči",
    "save": "Shrani",
    "error": "Napaka",
    "delete": "Izbriši",
    "copied": "Kopirano.",
    "copyFailed": "Ni mogoče kopirati.",
    "all": "Vse",
    "on": "Vklop",
    "off": "Izklop",
    "info": "Info",
    "me": "Jaz",
    "remove": "Odstrani",
    "rename": "Preimenuj",
    "success": "Uspeh",
    "male": "Moški",
    "female": "Ženska",
    "back": "Nazaj",
    "continue": "Nadaljuj",
    "create": "Ustvari",
    "join": "Pridruži se"
  },
  "settings": {
    "title": "Nastavitve",
    "subtitle": "Družina, jezik in profil",
    "setup": {
      "title": "Nastavi račun",
      "step1": "1) Pridruži se ali ustvari družino",
      "step2": "2) Nato nastavi svoje ime v Nastavitve → Družina",
      "whyName": "Tvoje ime se shrani kot član družine in je na voljo po pridružitvi.",
      "next": "Naslednji korak",
      "setNameNow": "Nastavi svoje ime, da te bodo drugi prepoznali."
    },
    "language": "Jezik",
    "languageHint": "Izberi jezik vmesnika.",
    "languageNote": "Ta sprememba velja za celotno aplikacijo.",
    "croatian": "Hrvaščina",
    "english": "Angleščina",
    "italian": "Italijanščina",
    "slovenian": "Slovenščina",
    "french": "Francoščina",
    "german": "Nemščina",
    "spanish": "Španščina",
    "serbian": "Srbščina",
    "family": {
      "notInFamily": "Nisi v družini.",
      "statusLine": "Družina: {{name}} (Vabilo: {{code}})",
      "title": "Družina",
      "notInFamilyTitle": "Še ni družine"
    },
    "about": "O aplikaciji",
    "account": "Račun",
    "aboutLine": "Družinska aplikacija za opravila in organizacijo.",
    "version": "Različica",
    "family_not_in_family": "Nisi v družini.",
    "btn": {
      "changeLanguage": "Zamenjaj jezik ({{lang}})",
      "editName": "Uredi ime",
      "copy": "Kopiraj",
      "renameFamily": "Preimenuj",
      "setName": "Nastavi ime",
      "leaveFamily": "Zapusti družino",
      "deleteFamily": "Izbriši družino",
      "showInviteCode": "Pokaži kodo povabila",
      "hideInviteCode": "Skrij kodo povabila",
      "createFamily": "Ustvari družino",
      "joinFamily": "Pridruži se družini",
      "join": "Pridruži se"
    },
    "msg": {
      "familyRenamed": "Ime družine posodobljeno."
    },
    "renameFamilyTitle": "Preimenuj družino",
    "renameFamilyPlaceholder": "Ime družine",
    "myName": "Moje ime",
    "myNamePlaceholder": "Ime",
    "nameRequired": "Vnesi ime.",
    "saved": "Shranjeno.",
    "labels": {
      "family": "Družina",
      "inviteCode": "Vabilna koda",
      "myName": "Tvoje ime"
    },
    "notSet": "Ni nastavljeno",
    "nameAfterJoin": "Pridruži se ali ustvari družino, da nastaviš ime.",
    "deleteFamily": {
      "help": "Družino lahko izbrišeš le, ko si edini član.",
      "title": "Izbriši družino",
      "body": "To bo trajno izbrisalo družino in vse podatke.",
      "confirm": "Vpiši DELETE za potrditev.",
      "deleted": "Družina izbrisana."
    },
    "joinFamily": {
      "help": "Vnesi kodo povabila od družinskega člana.",
      "title": "Pridruži se družini",
      "placeholder": "Vabilo koda",
      "invalidCode": "Vnesi kodo vabila.",
      "joined": "Zdaj si v družini."
    },
    "createFamily": {
      "title": "Ustvari družino",
      "desc": "Ustvari novo družino in začni deliti naloge.",
      "placeholder": "Ime družine",
      "nameRequired": "Ime družine je obvezno.",
      "created": "Družina ustvarjena."
    },
    "leaveFamily": {
      "title": "Zapusti družino",
      "body": "Ali si prepričan/a, da želiš zapustiti družino?",
      "confirm": "Zapusti",
      "left": "Zapustil/a si družino."
    },
    "myProfile": "Moj profil"
  },
  "tasks": {
    "status": {
      "open": "Odprto",
      "claimed": "Prevzeto",
      "review": "Za potrditev",
      "done": "Končano"
    },
    "filter": {
      "all": "Vse",
      "active": "Aktivno",
      "review": "Za potrditev",
      "done": "Končano"
    },
    "timelineHint": {
      "assigned": "Dodeljeno → Opravljeno → Odobreno",
      "created": "Ustvarjeno → Opravljeno → Odobreno"
    },
    "hideDoneOn": "Skrij končano: VKL",
    "hideDoneOff": "Skrij končano: IZKL",
    "emptyTitle": "Ni opravil",
    "emptySubtitle": "Ustvari prvo opravilo z + Novo",
    "actionsTitle": "Dejanja opravila",
    "edit": "Uredi",
    "editTitle": "Uredi opravilo",
    "newTitle": "Novo opravilo",
    "titlePlaceholder": "npr. Poberi otroke",
    "timePlaceholder": "Vnesi (HHMM) npr. 1630",
    "assignedTo": "Dodeli",
    "noAssignee": "Vsi",
    "titleRequired": "Naslov je obvezen.",
    "deleteConfirm": "Izbrišem to opravilo?",
    "claim": "Prevzemi",
    "unclaim": "Vrni",
    "requestDone": "Zahtevaj potrditev",
    "approve": "Odobri",
    "reject": "Zavrni",
    "reset": "Ponastavi",
    "calendar": "Koledar",
    "datePlaceholder": "Izberi datum",
    "due": {
      "none": "Brez roka"
    },
    "errors": {
      "actionFailed": "Dejanje ni uspelo.",
      "deleteFailed": "Brisanje ni uspelo.",
      "saveFailed": "Shranjevanje ni uspelo."
    },
    "repeat": {
      "auto": "Samodejno",
      "autoHint": "Samodejno dokončaj brez potrditve",
      "autoOff": "Izklopljeno",
      "autoOn": "Vklopljeno",
      "days": "dni",
      "none": "Ne ponavljaj",
      "label": "Ponovi"
    },
    "today": "Danes",
    "tomorrow": "Jutri",
    "assignTo": "Dodeli",
    "assign": {
      "none": "Ni dodeljeno",
      "select": "Izberi",
      "selectCta": "Izberi",
      "clear": "Počisti izbiro"
    },
    "title": "Opravila",
    "heroSub": "Hitri filtri in pregled",
    "newBtn": "+ Novo",
    "new": {
      "title": "Ustvari novo opravilo za družinskega člana",
      "placeholder": {
        "title": "npr. Pelji Luko na trening",
        "time": "npr. 16:30"
      },
      "hint": {
        "timeOptional": "Neobvezno: nastavi uro za opomnike."
      },
      "repeatEveryDays": "Ponovi vsakih",
      "assignTo": "Kdo naj to naredi?"
    },
    "newPrompt": "Kaj lahko danes narediš?",
    "when": "Kdaj?",
    "reminder": {
      "label": "Opomnik",
      "requiresTime": "Nastavi uro za opomnike."
    },
    "needsApproval": "Za potrditev",
    "nextDue": "Naslednji rok",
    "action": {
      "claim": "Prevzemi",
      "unclaim": "Vrni",
      "requestDone": "Zahtevaj potrditev",
      "approve": "Odobri",
      "reject": "Zavrni",
      "doneAuto": "Opravljeno",
      "illDoIt": "Jaz bom",
      "leave": "Zapusti",
      "markDone": "Označi kot končano",
      "notDone": "Ni končano",
      "accept": "Sprejmi",
      "take": "Prevzemi"
    },
    "repeatEveryPlaceholder": "Ponovi vsakih ___ dni (samo številke)",
    "repeatDaysPlaceholder": "___",
    "dateInvalid": "Izberi veljaven datum.",
    "timeInvalid": "Čas mora biti HHMM (npr. 1630).",
    "calendarMissing": "Izbirnik koledarja ni nameščen. Vnesi DDMM; koledar je neobvezen.",
    "active": "Aktivno",
    "done": "Končano",
    "review": "Za potrditev",
    "selectedDate": "Izbran datum",
    "dateNotSet": "—",
    "badge": {
      "open": "Odprto",
      "done": "Končano"
    }
  },
  "today": {
    "title": "Danes",
    "familyPrefix": "Družina",
    "pills": {
      "total": "Skupaj",
      "open": "Aktivno",
      "done": "Končano"
    },
    "anytime": "Kadar koli",
    "morning": "Zjutraj",
    "afternoon": "Popoldne",
    "evening": "Zvečer",
    "noTime": "Brez roka",
    "empty": {
      "title": "Danes ni opravil",
      "subtitle": "Dodaj opravila v Opravila in nastavi rok na danes.",
      "active": "Vse je opravljeno 🎉",
      "done": "Danes ni končanih opravil",
      "switch": "Spremeni filter zgoraj ali dodaj opravila v Opravila."
    }
  },
  "members": {
    "familyNameFallback": "Moja družina",
    "editHint": "Za urejanje člana tapni ⋮ na njegovi kartici.",
    "filter": {
      "all": "Vse",
      "kids": "Otroci",
      "parents": "Starši"
    },
    "kids": "Otroci",
    "listTitle": "Seznam članov",
    "noMembers": "Še ni članov.",
    "parents": "Starši",
    "stats": {
      "parents": "Starši",
      "kids": "Otroci",
      "todayDone": "Danes opravljeno",
      "done": "Končano",
      "family": "Vsa družinska opravila"
    },
    "defaultParent": "Starš",
    "defaultChild": "Otrok",
    "role": {
      "parent": "Starš",
      "child": "Otrok",
      "mom": "Mama",
      "dad": "Oče"
    },
    "doneToday": "Danes opravljeno",
    "changeOwnNameHint": "Spremeni svoje ime v Nastavitve → Profil.",
    "editMember": "Uredi člana",
    "hello": "Živjo",
    "lastParentCantChangeRole": "Vloge zadnjega starša ne moreš spremeniti. Najprej dodaj še enega starša.",
    "lastParentCantRemove": "Zadnjega starša ne moreš odstraniti. Najprej dodaj še enega starša.",
    "lastParentNotice": "To je zadnji starš, zato mu ne moreš spremeniti vloge ali ga odstraniti.",
    "memberFallback": "Član",
    "newNamePlaceholder": "Novo ime",
    "noFamilyBody": "Pridruži se/ustvari družino v Nastavitve → Družina.",
    "noFamilyTitle": "Še nisi v družini.",
    "overview": "Tukaj je pregled družinskih aktivnosti.",
    "removeBody": "Naloge ostanejo, vendar se član odstrani in vse dodelitve njemu se počistijo.",
    "removeTitle": "Odstraniti člana?",
    "roleTitle": "Vloga",
    "parent": "Starš",
    "child": "Otrok",
    "editHintLongPress": "Namig: dolgo pritisni člana za urejanje."
  },
  "auth": {
    "tagline": "Družinska opravila, poenostavljeno",
    "title": "Prijava",
    "registerTitle": "Ustvari račun",
    "email": "E‑pošta",
    "password": "Geslo",
    "confirmPassword": "Potrdi geslo",
    "togglePassword": "Pokaži ali skrij geslo",
    "placeholders": {
      "email": "ime@email.com",
      "password": "••••••••",
      "confirmPassword": "••••••••"
    },
    "passwordLoginBtn": "Prijavi se",
    "registerBtn": "Ustvari račun",
    "forgotPasswordBtn": "Pozabljeno geslo?",
    "sendMagicLinkBtn": "Pošlji magic link",
    "noAccount": "Nimaš računa?",
    "createAccount": "Ustvari ga",
    "haveAccount": "Že imaš račun?",
    "backToLogin": "Prijava",
    "alerts": {
      "missingEmailPasswordBody": "Vnesi e‑pošto in geslo.",
      "missingEmailBody": "Vnesi svojo e‑pošto.",
      "missingRegisterBody": "Vnesi e‑pošto in obe polji gesla.",
      "weakPasswordBody": "Geslo mora imeti vsaj 6 znakov.",
      "passwordMismatchBody": "Gesli se ne ujemata.",
      "loginErrorTitle": "Napaka pri prijavi",
      "resetSentBody": "Poslali smo ti e‑pošto s povezavo za nastavitev novega gesla.",
      "resetErrorTitle": "Napaka pri ponastavitvi",
      "magicLinkSentBody": "Magic link smo poslali na tvojo e‑pošto.",
      "magicLinkErrorTitle": "Napaka magic linka",
      "registerConfirmEmailBody": "Račun je ustvarjen. Potrdi e‑pošto preko povezave, nato se prijavi.",
      "registerOkBody": "Račun je ustvarjen. Zdaj se lahko prijaviš.",
      "registerErrorTitle": "Napaka pri registraciji"
    },
    "missingUid": "Nisi prijavljen (manjka ID člana).",
    "invalidEmail": "Vnesi veljavno e‑pošto.",
    "magicLinkSent": "Preveri e‑pošto za povezavo za prijavo.",
    "magicLinkHelp": "Po e‑pošti ti bomo poslali povezavo za prijavo.",
    "loginMagicLink": "Prijava (magic link)",
    "sendLink": "Pošlji povezavo",
    "logout": "Odjava",
    "signedInAs": "Prijavljen kot:"
  },
  "shopping": {
    "addBtn": "Dodaj",
    "addPlaceholder": "Dodaj artikel…",
    "deleteBody": "Želiš odstraniti ta artikel s seznama?",
    "deleteTitle": "Izbriši artikel",
    "emptyBody": "Dodaj artikle z uporabo polja zgoraj.",
    "emptyTitle": "Ni za kupiti",
    "errorTitle": "Nakupi",
    "me": "Jaz",
    "member": "Član",
    "noFamilyBody": "Pridruži se ali ustvari družino za skupni nakupovalni seznam.",
    "noFamilyTitle": "Nakupi",
    "subtitle": "Skupni seznam za vso družino.",
    "suggestedBy": "Predlagal",
    "toBuy": "Za kupiti",
    "title": "Nakupi",
    "goShop": "Pojdi v trgovino",
    "sendTitle": "Pošlji seznam",
    "sendPick": "Izberi, kdo gre v trgovino.",
    "sendEmpty": "Seznam je prazen.",
    "sendHeader": "Kdo gre v trgovino?",
    "sendHint": "Pošlji cel seznam kot eno obvestilo (brez spama).",
    "sentTitle": "Poslano",
    "sentBody": "Obvestilo s seznamom za nakup je bilo poslano.",
    "addedAt": "Dodano",
    "addedBy": "Dodano od",
    "bought": "Kupljeno",
    "bought7d": "Kupljeno (7 dni)",
    "boughtEmptyTitle": "Ni nedavnih nakupov",
    "boughtEmptyBody": "Izdelki, ki jih označiš kot kupljene, bodo tukaj prikazani 7 dni.",
    "boughtWhen": "Kupljeno",
    "chip": {
      "bread": "Kruh",
      "cheese": "Sir",
      "detergent": "Detergent za perilo",
      "dishSoap": "Detergent za posodo",
      "eggs": "Jajca",
      "fruit": "Sadje",
      "meat": "Meso",
      "milk": "Mleko",
      "shampoo": "Šampon",
      "toiletPaper": "Toaletni papir",
      "vegetables": "Zelenjava",
      "water": "Voda"
    }
  },
  "home": {
    "title": "Dnevne naloge",
    "subtitle": "Hiter pregled in fokus",
    "plannerToday": "Načrtovalnik — danes",
    "tasksLatest": "Naloge — najnovejše",
    "shopping": "Nakupovanje",
    "shoppingCartCount": "V košarici imaš {{count}} izdelkov",
    "viewMore": "Poglej več",
    "noFamilyShopping": "Pridruži se ali ustvari družino za skupni nakupovalni seznam.",
    "noTime": "Kadarkoli",
    "shoppingEmpty": "Nakupovalni seznam je prazen",
  },


  "planner": {
    "title": "Planer",
    "subtitle": "Tvoj preprost dnevni plan (zasebno ali deljeno).",
    "selectedDay": "Izbrano",
    "hintPickDay": "Izberi dan na koledarju, nato tapni + Novo",
    "newBtn": "+ Novo",
    "newTitle": "Nov plan",
    "editTitle": "Uredi plan",
    "placeholder": {
      "title": "npr. zdravnik, plačati račune, poklicati babico"
    },
    "timeLabel": "Čas (neobvezno)",
    "timePlaceholder": "HHMM (npr. 1630)",
    "anytime": "Kadarkoli",
    "for": "Za",
    "shared": "Deljeno",
    "forWho": "Za koga?",
    "family": "Družina",
    "someone": "Nekdo",
    "assigned": {
      "all": "Družina",
      "some": "Izbrano"
    },
    "someHint": "Namig: izberi enega ali več članov. (Dolg pritisk za brisanje)",
    "noFamilyHint": "Namig: pridruži se družini, da deliš plan s članom.",
    "noStorage": "Opomba: AsyncStorage ni nameščen, zato se bodo plani po ponovnem zagonu aplikacije ponastavili.",
    "calendarMissing": "Komponenta koledarja ni nameščena. Če želiš mesečni pogled, namesti react-native-calendars.",
    "emptyTitle": "Ni planov",
    "emptyBody": "Tapni + Novo in dodaj prvi plan za ta dan.",
    "titleRequired": "Naslov je obvezen.",
    "timeInvalid": "Čas mora biti HH:MM (npr. 1630).",
    "pickSomeone": "Izberi vsaj enega člana.",
    "deleteConfirm": "Izbrisati ta element?"
  }
};

const fr = {
  "tabs": {
    "home": "Aujourd’hui",
    "members": "Membres",
    "tasks": "Tâches",
    "shopping": "Courses",
    "settings": "Réglages"
  },
  "onboarding": {
    "profile": {
      "title": "Configure ton profil",
      "subtitle": "Cela aide la famille à reconnaître qui est qui.",
      "name": "Ton nom",
      "role": "Tu es",
      "gender": "Genre",
      "male": "Homme",
      "female": "Femme",
      "autoAvatar": "L’avatar sera défini automatiquement"
    },
    "family": {
      "title": "Rejoindre ou créer une famille",
      "subtitle": "Tu peux rejoindre avec un code ou créer une nouvelle famille.",
      "joinTitle": "Rejoindre une famille existante",
      "joinSub": "Saisis le code famille reçu d’un parent.",
      "createTitle": "Créer une nouvelle famille",
      "createSub": "Choisis un nom de famille et invite les autres plus tard."
    }
  },
  "common": {
    "loading": "Chargement...",
    "ok": "OK",
    "cancel": "Annuler",
    "save": "Enregistrer",
    "error": "Erreur",
    "delete": "Supprimer",
    "copied": "Copié.",
    "copyFailed": "Impossible de copier.",
    "all": "Tous",
    "on": "Activé",
    "off": "Désactivé",
    "info": "Info",
    "me": "Moi",
    "remove": "Supprimer",
    "rename": "Renommer",
    "success": "Succès",
    "male": "Homme",
    "female": "Femme",
    "back": "Retour",
    "continue": "Continuer",
    "create": "Créer",
    "join": "Rejoindre"
  },
  "settings": {
    "title": "Réglages",
    "subtitle": "Famille, langue et profil",
    "setup": {
      "title": "Configurer votre compte",
      "step1": "1) Rejoignez ou créez une famille",
      "step2": "2) Puis définissez votre nom dans Paramètres → Famille",
      "whyName": "Votre nom est enregistré comme membre de la famille et devient disponible après l’adhésion.",
      "next": "Prochaine étape",
      "setNameNow": "Définissez votre nom pour que les autres puissent vous reconnaître."
    },
    "language": "Langue",
    "languageHint": "Choisissez la langue de l’interface.",
    "languageNote": "Ce changement s’applique à toute l’application.",
    "croatian": "Croate",
    "english": "Anglais",
    "italian": "Italien",
    "slovenian": "Slovène",
    "french": "Français",
    "german": "Allemand",
    "spanish": "Espagnol",
    "serbian": "Serbe",
    "family": {
      "notInFamily": "Vous n’êtes pas dans une famille.",
      "statusLine": "Famille : {{name}} (Invitation : {{code}})",
      "title": "Famille",
      "notInFamilyTitle": "Pas de famille"
    },
    "about": "À propos",
    "account": "Compte",
    "aboutLine": "Application familiale pour les tâches et l’organisation.",
    "version": "Version",
    "family_not_in_family": "Vous n’êtes pas dans une famille.",
    "btn": {
      "changeLanguage": "Changer la langue ({{lang}})",
      "editName": "Modifier le nom",
      "copy": "Copier",
      "renameFamily": "Renommer",
      "setName": "Définir mon nom",
      "leaveFamily": "Quitter la famille",
      "deleteFamily": "Supprimer la famille",
      "showInviteCode": "Afficher le code",
      "hideInviteCode": "Masquer le code",
      "createFamily": "Créer une famille",
      "joinFamily": "Rejoindre une famille",
      "join": "Rejoindre"
    },
    "msg": {
      "familyRenamed": "Nom de la famille mis à jour."
    },
    "renameFamilyTitle": "Renommer la famille",
    "renameFamilyPlaceholder": "Nom de la famille",
    "myName": "Mon nom",
    "myNamePlaceholder": "Nom",
    "nameRequired": "Veuillez saisir un nom.",
    "saved": "Enregistré.",
    "labels": {
      "family": "Famille",
      "inviteCode": "Code d’invitation",
      "myName": "Ton nom"
    },
    "notSet": "Non défini",
    "nameAfterJoin": "Rejoignez ou créez une famille pour définir votre nom.",
    "deleteFamily": {
      "help": "Vous ne pouvez supprimer la famille que si vous êtes le seul membre.",
      "title": "Supprimer la famille",
      "body": "Cela supprimera définitivement la famille et toutes ses données.",
      "confirm": "Tape DELETE pour confirmer.",
      "deleted": "Famille supprimée."
    },
    "joinFamily": {
      "help": "Entrez un code d’invitation d’un membre de la famille.",
      "title": "Rejoindre une famille",
      "placeholder": "Code d’invitation",
      "invalidCode": "Saisis le code d’invitation.",
      "joined": "Tu fais maintenant partie de la famille."
    },
    "createFamily": {
      "title": "Créer une famille",
      "desc": "Crée une nouvelle famille pour commencer à partager les tâches.",
      "placeholder": "Nom de la famille",
      "nameRequired": "Le nom de la famille est obligatoire.",
      "created": "Famille créée."
    },
    "leaveFamily": {
      "title": "Quitter la famille",
      "body": "Es-tu sûr(e) de vouloir quitter la famille ?",
      "confirm": "Quitter",
      "left": "Tu as quitté la famille."
    },
    "myProfile": "Mon profil"
  },
  "tasks": {
    "status": {
      "open": "Ouverte",
      "claimed": "Prise",
      "review": "À valider",
      "done": "Terminé"
    },
    "filter": {
      "all": "Toutes",
      "active": "Actives",
      "review": "À valider",
      "done": "Terminées"
    },
    "timelineHint": {
      "assigned": "Assigné → Fait → Approuvé",
      "created": "Créé → Fait → Approuvé"
    },
    "hideDoneOn": "Masquer terminées : ON",
    "hideDoneOff": "Masquer terminées : OFF",
    "emptyTitle": "Aucune tâche",
    "emptySubtitle": "Créez la première tâche avec + Nouveau",
    "actionsTitle": "Actions de la tâche",
    "edit": "Modifier",
    "editTitle": "Modifier la tâche",
    "newTitle": "Nouvelle tâche",
    "titlePlaceholder": "ex. Aller chercher les enfants",
    "timePlaceholder": "Saisir (HHMM) ex. 1630",
    "assignedTo": "Attribuer à",
    "noAssignee": "Tout le monde",
    "titleRequired": "Le titre est obligatoire.",
    "deleteConfirm": "Supprimer cette tâche ?",
    "claim": "Prendre",
    "unclaim": "Rendre",
    "requestDone": "Demander validation",
    "approve": "Approuver",
    "reject": "Refuser",
    "reset": "Réinitialiser",
    "calendar": "Calendrier",
    "datePlaceholder": "Choisir une date",
    "due": {
      "none": "Sans échéance"
    },
    "errors": {
      "actionFailed": "Action échouée.",
      "deleteFailed": "Suppression échouée.",
      "saveFailed": "Enregistrement échoué."
    },
    "repeat": {
      "auto": "Auto",
      "autoHint": "Terminer automatiquement sans approbation",
      "autoOff": "Désactivé",
      "autoOn": "Activé",
      "days": "jours",
      "none": "Ne pas répéter",
      "label": "Répéter"
    },
    "today": "Aujourd’hui",
    "tomorrow": "Demain",
    "assignTo": "Attribuer à",
    "assign": {
      "none": "Non attribué",
      "select": "Sélectionner",
      "selectCta": "Sélectionner",
      "clear": "Effacer la sélection"
    },
    "title": "Tâches",
    "heroSub": "Filtres rapides et aperçu",
    "newBtn": "+ Nouveau",
    "new": {
      "title": "Créer une nouvelle tâche pour un membre de la famille",
      "placeholder": {
        "title": "ex. Emmener Luka à l’entraînement",
        "time": "ex. 16:30"
      },
      "hint": {
        "timeOptional": "Facultatif : définissez une heure pour activer les rappels."
      },
      "repeatEveryDays": "Répéter tous les",
      "assignTo": "Qui doit le faire ?"
    },
    "newPrompt": "Que peux-tu faire aujourd’hui ?",
    "when": "Quand ?",
    "reminder": {
      "label": "Rappel",
      "requiresTime": "Définissez une heure pour activer les rappels."
    },
    "needsApproval": "À approuver",
    "nextDue": "Prochaine échéance",
    "action": {
      "claim": "Prendre",
      "unclaim": "Rendre",
      "requestDone": "Demander validation",
      "approve": "Approuver",
      "reject": "Refuser",
      "doneAuto": "Terminé",
      "illDoIt": "Je m’en charge",
      "leave": "Quitter",
      "markDone": "Marquer terminé",
      "notDone": "Pas terminé",
      "accept": "Accepter",
      "take": "Prendre"
    },
    "repeatEveryPlaceholder": "Répéter tous les ___ jours (chiffres uniquement)",
    "repeatDaysPlaceholder": "___",
    "dateInvalid": "Choisis une date valide.",
    "timeInvalid": "L’heure doit être HHMM (ex. 1630).",
    "calendarMissing": "Sélecteur calendrier non installé. Saisis JJMM ; le calendrier est optionnel.",
    "active": "Actif",
    "done": "Terminé",
    "review": "À valider",
    "selectedDate": "Date sélectionnée",
    "dateNotSet": "—",
    "badge": {
      "open": "Ouvert",
      "done": "Terminé"
    }
  },
  "today": {
    "title": "Aujourd’hui",
    "familyPrefix": "Famille",
    "pills": {
      "total": "Total",
      "open": "Actives",
      "done": "Terminées"
    },
    "anytime": "À tout moment",
    "morning": "Matin",
    "afternoon": "Après‑midi",
    "evening": "Soir",
    "noTime": "Sans échéance",
    "empty": {
      "title": "Aucune tâche aujourd’hui",
      "subtitle": "Ajoute des tâches dans Tâches et fixe l’échéance à aujourd’hui.",
      "active": "Tout est fait 🎉",
      "done": "Aucune tâche terminée aujourd’hui",
      "switch": "Change le filtre ci‑dessus ou ajoute des tâches dans Tâches."
    }
  },
  "members": {
    "familyNameFallback": "Ma famille",
    "editHint": "Pour modifier un membre, touchez ⋮ sur sa carte.",
    "filter": {
      "all": "Tous",
      "kids": "Enfants",
      "parents": "Parents"
    },
    "kids": "Enfants",
    "listTitle": "Liste des membres",
    "noMembers": "Aucun membre pour l’instant.",
    "parents": "Parents",
    "stats": {
      "parents": "Parents",
      "kids": "Enfants",
      "todayDone": "Terminé aujourd’hui",
      "done": "Terminé",
      "family": "Toutes les tâches familiales"
    },
    "defaultParent": "Parent",
    "defaultChild": "Enfant",
    "role": {
      "parent": "Parent",
      "child": "Enfant",
      "mom": "Maman",
      "dad": "Papa"
    },
    "doneToday": "Fait aujourd’hui",
    "changeOwnNameHint": "Change ton nom dans Réglages → Profil.",
    "editMember": "Modifier le membre",
    "hello": "Salut",
    "lastParentCantChangeRole": "Tu ne peux pas changer le rôle du dernier parent. Ajoute d’abord un autre parent.",
    "lastParentCantRemove": "Tu ne peux pas supprimer le dernier parent. Ajoute d’abord un autre parent.",
    "lastParentNotice": "C’est le dernier parent, tu ne peux donc pas changer son rôle ni le supprimer.",
    "memberFallback": "Membre",
    "newNamePlaceholder": "Nouveau nom",
    "noFamilyBody": "Rejoins/crée une famille dans Réglages → Famille.",
    "noFamilyTitle": "Tu n’es pas encore dans une famille.",
    "overview": "Voici un aperçu des activités de ta famille.",
    "removeBody": "Les tâches restent, mais le membre est supprimé et toutes les attributions le concernant sont effacées.",
    "removeTitle": "Supprimer le membre ?",
    "roleTitle": "Rôle",
    "parent": "Parent",
    "child": "Enfant",
    "editHintLongPress": "Astuce : appuie longuement sur un membre pour modifier."
  },
  "auth": {
    "tagline": "Tâches familiales, simplifiées",
    "title": "Connexion",
    "registerTitle": "Créer un compte",
    "email": "E‑mail",
    "password": "Mot de passe",
    "confirmPassword": "Confirmer le mot de passe",
    "togglePassword": "Afficher ou masquer le mot de passe",
    "placeholders": {
      "email": "nom@email.com",
      "password": "••••••••",
      "confirmPassword": "••••••••"
    },
    "passwordLoginBtn": "Se connecter",
    "registerBtn": "Créer un compte",
    "forgotPasswordBtn": "Mot de passe oublié ?",
    "sendMagicLinkBtn": "Envoyer un magic link",
    "noAccount": "Pas de compte ?",
    "createAccount": "En créer un",
    "haveAccount": "Déjà un compte ?",
    "backToLogin": "Connexion",
    "alerts": {
      "missingEmailPasswordBody": "Saisis l’e‑mail et le mot de passe.",
      "missingEmailBody": "Saisis ton e‑mail.",
      "missingRegisterBody": "Saisis l’e‑mail et les deux champs de mot de passe.",
      "weakPasswordBody": "Le mot de passe doit contenir au moins 6 caractères.",
      "passwordMismatchBody": "Les mots de passe ne correspondent pas.",
      "loginErrorTitle": "Erreur de connexion",
      "resetSentBody": "Nous t’avons envoyé un e‑mail avec un lien pour définir un nouveau mot de passe.",
      "resetErrorTitle": "Erreur de réinitialisation",
      "magicLinkSentBody": "Un magic link a été envoyé à ton e‑mail.",
      "magicLinkErrorTitle": "Erreur magic link",
      "registerConfirmEmailBody": "Compte créé. Confirme ton adresse e‑mail via le lien envoyé, puis connecte‑toi.",
      "registerOkBody": "Compte créé. Tu peux te connecter maintenant.",
      "registerErrorTitle": "Erreur d’inscription"
    },
    "missingUid": "Vous n’êtes pas connecté (ID membre manquant).",
    "invalidEmail": "Saisis un e‑mail valide.",
    "magicLinkSent": "Vérifie ton e‑mail pour le lien de connexion.",
    "magicLinkHelp": "Nous t’enverrons un lien de connexion par e‑mail.",
    "loginMagicLink": "Connexion (magic link)",
    "sendLink": "Envoyer le lien",
    "logout": "Déconnexion",
    "signedInAs": "Connecté en tant que :"
  },
  "shopping": {
    "addBtn": "Ajouter",
    "addPlaceholder": "Ajouter un article…",
    "deleteBody": "Voulez-vous retirer cet article de la liste ?",
    "deleteTitle": "Supprimer l’article",
    "emptyBody": "Ajoutez des articles avec le champ ci-dessus.",
    "emptyTitle": "Rien à acheter",
    "errorTitle": "Courses",
    "me": "Moi",
    "member": "Membre",
    "noFamilyBody": "Rejoignez ou créez une famille pour utiliser la liste de courses partagée.",
    "noFamilyTitle": "Courses",
    "subtitle": "Liste partagée pour toute la famille.",
    "suggestedBy": "Suggéré par",
    "toBuy": "À acheter",
    "title": "Courses",
    "goShop": "Aller faire les courses",
    "sendTitle": "Envoyer la liste",
    "sendPick": "Choisis qui va faire les courses.",
    "sendEmpty": "La liste est vide.",
    "sendHeader": "Qui va faire les courses ?",
    "sendHint": "Envoie toute la liste en une seule notification (sans spam).",
    "sentTitle": "Envoyé",
    "sentBody": "La notification de la liste de courses a été envoyée.",
    "addedAt": "Ajouté",
    "addedBy": "Ajouté par",
    "bought": "Acheté",
    "bought7d": "Acheté (7 jours)",
    "boughtEmptyTitle": "Aucun achat récent",
    "boughtEmptyBody": "Les articles marqués comme achetés apparaîtront ici pendant 7 jours.",
    "boughtWhen": "Acheté",
    "chip": {
      "bread": "Pain",
      "cheese": "Fromage",
      "detergent": "Lessive",
      "dishSoap": "Liquide vaisselle",
      "eggs": "Œufs",
      "fruit": "Fruits",
      "meat": "Viande",
      "milk": "Lait",
      "shampoo": "Shampooing",
      "toiletPaper": "Papier toilette",
      "vegetables": "Légumes",
      "water": "Eau"
    }
  },
  "home": {
    "title": "Tâches du jour",
    "subtitle": "Aperçu rapide et focus",
    "plannerToday": "Agenda — aujourd’hui",
    "tasksLatest": "Tâches — récentes",
    "shopping": "Courses",
    "shoppingCartCount": "Vous avez {{count}} articles dans le panier",
    "viewMore": "Voir plus",
    "noFamilyShopping": "Rejoignez ou créez une famille pour utiliser la liste de courses partagée.",
    "noTime": "N’importe quand",
    "shoppingEmpty": "La liste de courses est vide",
  },


  "planner": {
    "title": "Planning",
    "subtitle": "Votre plan quotidien simple (privé ou partagé).",
    "selectedDay": "Sélectionné",
    "hintPickDay": "Choisis un jour sur le calendrier, puis touche + Nouveau",
    "newBtn": "+ Nouveau",
    "newTitle": "Nouveau plan",
    "editTitle": "Modifier le plan",
    "placeholder": {
      "title": "ex. médecin, payer les factures, appeler mamie"
    },
    "timeLabel": "Heure (optionnel)",
    "timePlaceholder": "HHMM (ex. 1630)",
    "anytime": "N'importe",
    "for": "Pour",
    "shared": "Partagé",
    "forWho": "Pour qui ?",
    "family": "Famille",
    "someone": "Quelqu’un",
    "assigned": {
      "all": "Famille",
      "some": "Sélectionné"
    },
    "someHint": "Astuce : sélectionne un ou plusieurs membres. (Appui long pour supprimer)",
    "noFamilyHint": "Astuce : rejoins une famille pour partager un plan avec un membre.",
    "noStorage": "Remarque : AsyncStorage n'est pas installé, donc les plans seront réinitialisés au rechargement de l'app.",
    "calendarMissing": "Le composant calendrier n'est pas installé. Pour la vue mensuelle, installe react-native-calendars.",
    "emptyTitle": "Aucun plan pour l’instant",
    "emptyBody": "Touche + Nouveau et ajoute ton premier plan pour ce jour.",
    "titleRequired": "Le titre est obligatoire.",
    "timeInvalid": "L'heure doit être au format HH:MM (ex. 1630).",
    "pickSomeone": "Choisis au moins un membre.",
    "deleteConfirm": "Supprimer cet élément ?"
  }
};

const de = {
  "tabs": {
    "home": "Heute",
    "members": "Mitglieder",
    "tasks": "Aufgaben",
    "shopping": "Einkauf",
    "settings": "Einstellungen"
  },
  "onboarding": {
    "profile": {
      "title": "Richte dein Profil ein",
      "subtitle": "So kann die Familie erkennen, wer wer ist.",
      "name": "Dein Name",
      "role": "Du bist",
      "gender": "Geschlecht",
      "male": "Männlich",
      "female": "Weiblich",
      "autoAvatar": "Avatar wird automatisch gesetzt"
    },
    "family": {
      "title": "Familie beitreten oder erstellen",
      "subtitle": "Du kannst mit einem Code beitreten oder eine neue Familie erstellen.",
      "joinTitle": "Bestehender Familie beitreten",
      "joinSub": "Gib den Familiencode ein, den du von einem Elternteil erhalten hast.",
      "createTitle": "Neue Familie erstellen",
      "createSub": "Wähle einen Familiennamen und lade andere später ein."
    }
  },
  "common": {
    "loading": "Laden...",
    "ok": "OK",
    "cancel": "Abbrechen",
    "save": "Speichern",
    "error": "Fehler",
    "delete": "Löschen",
    "copied": "Kopiert.",
    "copyFailed": "Kopieren nicht möglich.",
    "all": "Alle",
    "on": "An",
    "off": "Aus",
    "info": "Info",
    "me": "Ich",
    "remove": "Entfernen",
    "rename": "Umbenennen",
    "success": "Erfolg",
    "male": "Männlich",
    "female": "Weiblich",
    "back": "Zurück",
    "continue": "Weiter",
    "create": "Erstellen",
    "join": "Beitreten"
  },
  "settings": {
    "title": "Einstellungen",
    "subtitle": "Familie, Sprache und Profil",
    "setup": {
      "title": "Konto einrichten",
      "step1": "1) Einer Familie beitreten oder eine erstellen",
      "step2": "2) Dann deinen Namen in Einstellungen → Familie setzen",
      "whyName": "Dein Name wird als Familienmitglied gespeichert und ist nach dem Beitritt verfügbar.",
      "next": "Nächster Schritt",
      "setNameNow": "Lege deinen Namen fest, damit andere dich erkennen."
    },
    "language": "Sprache",
    "languageHint": "Wähle die Sprache der Oberfläche.",
    "languageNote": "Diese Änderung gilt für die gesamte App.",
    "croatian": "Kroatisch",
    "english": "Englisch",
    "italian": "Italienisch",
    "slovenian": "Slowenisch",
    "french": "Französisch",
    "german": "Deutsch",
    "spanish": "Spanisch",
    "serbian": "Serbisch",
    "family": {
      "notInFamily": "Du bist in keiner Familie.",
      "statusLine": "Familie: {{name}} (Einladung: {{code}})",
      "title": "Familie",
      "notInFamilyTitle": "Noch keine Familie"
    },
    "about": "Über",
    "account": "Konto",
    "aboutLine": "Familien‑App für Aufgaben und Organisation.",
    "version": "Version",
    "family_not_in_family": "Du bist in keiner Familie.",
    "btn": {
      "changeLanguage": "Sprache ändern ({{lang}})",
      "editName": "Name bearbeiten",
      "copy": "Kopieren",
      "renameFamily": "Umbenennen",
      "setName": "Namen festlegen",
      "leaveFamily": "Familie verlassen",
      "deleteFamily": "Familie löschen",
      "showInviteCode": "Einladungscode anzeigen",
      "hideInviteCode": "Einladungscode ausblenden",
      "createFamily": "Familie erstellen",
      "joinFamily": "Familie beitreten",
      "join": "Beitreten"
    },
    "msg": {
      "familyRenamed": "Familienname aktualisiert."
    },
    "renameFamilyTitle": "Familie umbenennen",
    "renameFamilyPlaceholder": "Familienname",
    "myName": "Mein Name",
    "myNamePlaceholder": "Name",
    "nameRequired": "Bitte einen Namen eingeben.",
    "saved": "Gespeichert.",
    "labels": {
      "family": "Familie",
      "inviteCode": "Einladungscode",
      "myName": "Dein Name"
    },
    "notSet": "Nicht gesetzt",
    "nameAfterJoin": "Tritt einer Familie bei oder erstelle eine, um deinen Namen festzulegen.",
    "deleteFamily": {
      "help": "Du kannst die Familie nur löschen, wenn du das einzige Mitglied bist.",
      "title": "Familie löschen",
      "body": "Dies löscht die Familie und alle Daten dauerhaft.",
      "confirm": "Gib DELETE ein, um zu bestätigen.",
      "deleted": "Familie gelöscht."
    },
    "joinFamily": {
      "help": "Gib einen Einladungscode von einem Familienmitglied ein.",
      "title": "Familie beitreten",
      "placeholder": "Einladungscode",
      "invalidCode": "Gib den Einladungscode ein.",
      "joined": "Du bist jetzt in der Familie."
    },
    "createFamily": {
      "title": "Familie erstellen",
      "desc": "Erstelle eine neue Familie, um Aufgaben zu teilen.",
      "placeholder": "Familienname",
      "nameRequired": "Familienname ist erforderlich.",
      "created": "Familie erstellt."
    },
    "leaveFamily": {
      "title": "Familie verlassen",
      "body": "Bist du sicher, dass du die Familie verlassen möchtest?",
      "confirm": "Verlassen",
      "left": "Du hast die Familie verlassen."
    },
    "myProfile": "Mein Profil"
  },
  "tasks": {
    "status": {
      "open": "Offen",
      "claimed": "Übernommen",
      "review": "Zur Freigabe",
      "done": "Erledigt"
    },
    "filter": {
      "all": "Alle",
      "active": "Aktiv",
      "review": "Zur Freigabe",
      "done": "Erledigt"
    },
    "timelineHint": {
      "assigned": "Zugewiesen → Erledigt → Genehmigt",
      "created": "Erstellt → Erledigt → Genehmigt"
    },
    "hideDoneOn": "Erledigte ausblenden: AN",
    "hideDoneOff": "Erledigte ausblenden: AUS",
    "emptyTitle": "Keine Aufgaben",
    "emptySubtitle": "Erste Aufgabe mit + Neu erstellen",
    "actionsTitle": "Aufgabenaktionen",
    "edit": "Bearbeiten",
    "editTitle": "Aufgabe bearbeiten",
    "newTitle": "Neue Aufgabe",
    "titlePlaceholder": "z. B. Kinder abholen",
    "timePlaceholder": "Eingabe (HHMM) z. B. 1630",
    "assignedTo": "Zuweisen an",
    "noAssignee": "Alle",
    "titleRequired": "Titel ist erforderlich.",
    "deleteConfirm": "Diese Aufgabe löschen?",
    "claim": "Übernehmen",
    "unclaim": "Zurückgeben",
    "requestDone": "Freigabe anfordern",
    "approve": "Genehmigen",
    "reject": "Ablehnen",
    "reset": "Zurücksetzen",
    "calendar": "Kalender",
    "datePlaceholder": "Datum wählen",
    "due": {
      "none": "Kein Termin"
    },
    "errors": {
      "actionFailed": "Aktion fehlgeschlagen.",
      "deleteFailed": "Löschen fehlgeschlagen.",
      "saveFailed": "Speichern fehlgeschlagen."
    },
    "repeat": {
      "auto": "Auto",
      "autoHint": "Automatisch abschließen ohne Freigabe",
      "autoOff": "Aus",
      "autoOn": "An",
      "days": "Tage",
      "none": "Nicht wiederholen",
      "label": "Wiederholen"
    },
    "today": "Heute",
    "tomorrow": "Morgen",
    "assignTo": "Zuweisen an",
    "assign": {
      "none": "Nicht zugewiesen",
      "select": "Auswählen",
      "selectCta": "Auswählen",
      "clear": "Auswahl löschen"
    },
    "title": "Aufgaben",
    "heroSub": "Schnelle Filter & Übersicht",
    "newBtn": "+ Neu",
    "new": {
      "title": "Neue Aufgabe für ein Familienmitglied erstellen",
      "placeholder": {
        "title": "z. B. Luka zum Training bringen",
        "time": "z. B. 16:30"
      },
      "hint": {
        "timeOptional": "Optional: Stelle eine Uhrzeit ein, um Erinnerungen zu aktivieren."
      },
      "repeatEveryDays": "Wiederholen alle",
      "assignTo": "Wer soll das machen?"
    },
    "newPrompt": "Was kannst du heute erledigen?",
    "when": "Wann?",
    "reminder": {
      "label": "Erinnerung",
      "requiresTime": "Stelle eine Uhrzeit ein, um Erinnerungen zu aktivieren."
    },
    "needsApproval": "Zur Freigabe",
    "nextDue": "Nächster Termin",
    "action": {
      "claim": "Übernehmen",
      "unclaim": "Zurückgeben",
      "requestDone": "Erledigt anfragen",
      "approve": "Freigeben",
      "reject": "Ablehnen",
      "doneAuto": "Erledigt",
      "illDoIt": "Ich mache es",
      "leave": "Verlassen",
      "markDone": "Als erledigt markieren",
      "notDone": "Nicht erledigt",
      "accept": "Annehmen",
      "take": "Übernehmen"
    },
    "repeatEveryPlaceholder": "Alle ___ Tage wiederholen (nur Zahlen)",
    "repeatDaysPlaceholder": "___",
    "dateInvalid": "Wähle ein gültiges Datum.",
    "timeInvalid": "Zeit muss HHMM sein (z. B. 1630).",
    "calendarMissing": "Kalenderauswahl nicht installiert. Gib TTMM ein; Kalender ist optional.",
    "active": "Aktiv",
    "done": "Erledigt",
    "review": "Zur Bestätigung",
    "selectedDate": "Ausgewähltes Datum",
    "dateNotSet": "—",
    "badge": {
      "open": "Offen",
      "done": "Erledigt"
    }
  },
  "today": {
    "title": "Heute",
    "familyPrefix": "Familie",
    "pills": {
      "total": "Gesamt",
      "open": "Aktiv",
      "done": "Erledigt"
    },
    "anytime": "Jederzeit",
    "morning": "Morgen",
    "afternoon": "Nachmittag",
    "evening": "Abend",
    "noTime": "Ohne Fälligkeit",
    "empty": {
      "title": "Keine Aufgaben heute",
      "subtitle": "Füge Aufgaben in Aufgaben hinzu und setze das Fälligkeitsdatum auf heute.",
      "active": "Alles erledigt 🎉",
      "done": "Heute keine erledigten Aufgaben",
      "switch": "Filter oben ändern oder Aufgaben in Aufgaben hinzufügen."
    }
  },
  "members": {
    "familyNameFallback": "Meine Familie",
    "editHint": "Zum Bearbeiten eines Mitglieds tippe ⋮ auf seiner Karte.",
    "filter": {
      "all": "Alle",
      "kids": "Kinder",
      "parents": "Eltern"
    },
    "kids": "Kinder",
    "listTitle": "Mitgliederliste",
    "noMembers": "Noch keine Mitglieder.",
    "parents": "Eltern",
    "stats": {
      "parents": "Eltern",
      "kids": "Kinder",
      "todayDone": "Heute erledigt",
      "done": "Erledigt",
      "family": "Alle Familienaufgaben"
    },
    "defaultParent": "Elternteil",
    "defaultChild": "Kind",
    "role": {
      "parent": "Elternteil",
      "child": "Kind",
      "mom": "Mama",
      "dad": "Papa"
    },
    "doneToday": "Heute erledigt",
    "changeOwnNameHint": "Ändere deinen Namen in Einstellungen → Profil.",
    "editMember": "Mitglied bearbeiten",
    "hello": "Hallo",
    "lastParentCantChangeRole": "Du kannst die Rolle des letzten Elternteils nicht ändern. Füge zuerst ein weiteres Elternteil hinzu.",
    "lastParentCantRemove": "Du kannst den letzten Elternteil nicht entfernen. Füge zuerst ein weiteres Elternteil hinzu.",
    "lastParentNotice": "Das ist der letzte Elternteil – du kannst seine Rolle nicht ändern oder ihn entfernen.",
    "memberFallback": "Mitglied",
    "newNamePlaceholder": "Neuer Name",
    "noFamilyBody": "Tritt einer Familie bei/erstelle eine Familie unter Einstellungen → Familie.",
    "noFamilyTitle": "Du bist noch in keiner Familie.",
    "overview": "Hier ist eine Übersicht über eure Familienaktivitäten.",
    "removeBody": "Aufgaben bleiben erhalten, aber das Mitglied wird entfernt und alle Zuweisungen an diese Person werden gelöscht.",
    "removeTitle": "Mitglied entfernen?",
    "roleTitle": "Rolle",
    "parent": "Elternteil",
    "child": "Kind",
    "editHintLongPress": "Tipp: Mitglied lange drücken zum Bearbeiten."
  },
  "auth": {
    "tagline": "Familienaufgaben, ganz einfach",
    "title": "Anmelden",
    "registerTitle": "Konto erstellen",
    "email": "E‑Mail",
    "password": "Passwort",
    "confirmPassword": "Passwort bestätigen",
    "togglePassword": "Passwort anzeigen oder verbergen",
    "placeholders": {
      "email": "name@email.com",
      "password": "••••••••",
      "confirmPassword": "••••••••"
    },
    "passwordLoginBtn": "Anmelden",
    "registerBtn": "Konto erstellen",
    "forgotPasswordBtn": "Passwort vergessen?",
    "sendMagicLinkBtn": "Magic Link senden",
    "noAccount": "Noch kein Konto?",
    "createAccount": "Jetzt erstellen",
    "haveAccount": "Schon ein Konto?",
    "backToLogin": "Anmelden",
    "alerts": {
      "missingEmailPasswordBody": "E‑Mail und Passwort eingeben.",
      "missingEmailBody": "E‑Mail eingeben.",
      "missingRegisterBody": "E‑Mail und beide Passwortfelder eingeben.",
      "weakPasswordBody": "Das Passwort muss mindestens 6 Zeichen lang sein.",
      "passwordMismatchBody": "Passwörter stimmen nicht überein.",
      "loginErrorTitle": "Anmeldefehler",
      "resetSentBody": "Wir haben dir eine E‑Mail mit einem Link zum Zurücksetzen des Passworts gesendet.",
      "resetErrorTitle": "Reset‑Fehler",
      "magicLinkSentBody": "Der Magic Link wurde an deine E‑Mail gesendet.",
      "magicLinkErrorTitle": "Magic‑Link‑Fehler",
      "registerConfirmEmailBody": "Konto erstellt. Bitte bestätige deine E‑Mail über den Link und melde dich dann an.",
      "registerOkBody": "Konto erstellt. Du kannst dich jetzt anmelden.",
      "registerErrorTitle": "Registrierungsfehler"
    },
    "missingUid": "Du bist nicht angemeldet (Mitglieds‑ID fehlt).",
    "invalidEmail": "Gib eine gültige E‑Mail ein.",
    "magicLinkSent": "Prüfe deine E‑Mail für den Anmelde‑Link.",
    "magicLinkHelp": "Wir senden dir einen Anmelde‑Link per E‑Mail.",
    "loginMagicLink": "Anmelden (Magic Link)",
    "sendLink": "Link senden",
    "logout": "Abmelden",
    "signedInAs": "Angemeldet als:"
  },
  "shopping": {
    "addBtn": "Hinzufügen",
    "addPlaceholder": "Artikel hinzufügen…",
    "deleteBody": "Möchtest du diesen Artikel von der Liste entfernen?",
    "deleteTitle": "Artikel löschen",
    "emptyBody": "Füge Artikel über das Feld oben hinzu.",
    "emptyTitle": "Nichts zu kaufen",
    "errorTitle": "Einkauf",
    "me": "Ich",
    "member": "Mitglied",
    "noFamilyBody": "Tritt einer Familie bei oder erstelle eine, um die gemeinsame Einkaufsliste zu nutzen.",
    "noFamilyTitle": "Einkauf",
    "subtitle": "Gemeinsame Liste für die ganze Familie.",
    "suggestedBy": "Vorgeschlagen von",
    "toBuy": "Zu kaufen",
    "title": "Einkauf",
    "goShop": "Einkaufen gehen",
    "sendTitle": "Liste senden",
    "sendPick": "Wähle, wer einkaufen geht.",
    "sendEmpty": "Die Liste ist leer.",
    "sendHeader": "Wer geht einkaufen?",
    "sendHint": "Sende die ganze Liste als eine Benachrichtigung (kein Spam).",
    "sentTitle": "Gesendet",
    "sentBody": "Die Einkaufslisten-Benachrichtigung wurde gesendet.",
    "addedAt": "Hinzugefügt",
    "addedBy": "Hinzugefügt von",
    "bought": "Gekauft",
    "bought7d": "Gekauft (7 Tage)",
    "boughtEmptyTitle": "Keine kürzlichen Einkäufe",
    "boughtEmptyBody": "Artikel, die du als gekauft markierst, erscheinen hier 7 Tage lang.",
    "boughtWhen": "Gekauft",
    "chip": {
      "bread": "Brot",
      "cheese": "Käse",
      "detergent": "Waschmittel",
      "dishSoap": "Spülmittel",
      "eggs": "Eier",
      "fruit": "Obst",
      "meat": "Fleisch",
      "milk": "Milch",
      "shampoo": "Shampoo",
      "toiletPaper": "Toilettenpapier",
      "vegetables": "Gemüse",
      "water": "Wasser"
    }
  },
  "home": {
    "title": "Tägliche Aufgaben",
    "subtitle": "Schneller Überblick und Fokus",
    "plannerToday": "Planer — heute",
    "tasksLatest": "Aufgaben — neueste",
    "shopping": "Einkaufen",
    "shoppingCartCount": "Du hast {{count}} Artikel im Warenkorb",
    "viewMore": "Mehr anzeigen",
    "noFamilyShopping": "Tritt einer Familie bei oder erstelle eine, um die gemeinsame Einkaufsliste zu nutzen.",
    "noTime": "Jederzeit",
    "shoppingEmpty": "Die Einkaufsliste ist leer",
  },


  "planner": {
    "title": "Planer",
    "subtitle": "Dein einfacher Tagesplan (privat oder geteilt).",
    "selectedDay": "Ausgewählt",
    "hintPickDay": "Wähle einen Tag im Kalender und tippe dann auf + Neu",
    "newBtn": "+ Neu",
    "newTitle": "Neuer Plan",
    "editTitle": "Plan bearbeiten",
    "placeholder": {
      "title": "z.B. Arzt, Rechnungen zahlen, Oma anrufen"
    },
    "timeLabel": "Uhrzeit (optional)",
    "timePlaceholder": "HHMM (z.B. 1630)",
    "anytime": "Beliebig",
    "for": "Für",
    "shared": "Geteilt",
    "forWho": "Für wen?",
    "family": "Familie",
    "someone": "Jemand",
    "assigned": {
      "all": "Familie",
      "some": "Ausgewählt"
    },
    "someHint": "Tipp: Wähle ein oder mehrere Mitglieder. (Langes Drücken zum Löschen)",
    "noFamilyHint": "Tipp: Tritt einer Familie bei, um einen Plan mit einem Mitglied zu teilen.",
    "noStorage": "Hinweis: AsyncStorage ist nicht installiert, daher werden Pläne beim Neuladen der App zurückgesetzt.",
    "calendarMissing": "Die Kalender-Komponente ist nicht installiert. Für die Monatsansicht installiere react-native-calendars.",
    "emptyTitle": "Noch keine Pläne",
    "emptyBody": "Tippe auf + Neu und füge den ersten Plan für diesen Tag hinzu.",
    "titleRequired": "Titel ist erforderlich.",
    "timeInvalid": "Die Uhrzeit muss HH:MM sein (z.B. 1630).",
    "pickSomeone": "Wähle mindestens ein Mitglied aus.",
    "deleteConfirm": "Diesen Eintrag löschen?"
  }
};

const es = {
  "tabs": {
    "home": "Hoy",
    "members": "Miembros",
    "tasks": "Tareas",
    "shopping": "Compras",
    "settings": "Ajustes"
  },
  "onboarding": {
    "profile": {
      "title": "Configura tu perfil",
      "subtitle": "Esto ayuda a la familia a reconocer quién es quién.",
      "name": "Tu nombre",
      "role": "Tú eres",
      "gender": "Género",
      "male": "Hombre",
      "female": "Mujer",
      "autoAvatar": "El avatar se configurará automáticamente"
    },
    "family": {
      "title": "Únete o crea una familia",
      "subtitle": "Puedes unirte con un código o crear una nueva familia.",
      "joinTitle": "Unirse a una familia existente",
      "joinSub": "Introduce el código de familia que te dio un padre/madre.",
      "createTitle": "Crear una nueva familia",
      "createSub": "Elige un nombre de familia e invita a otros más tarde."
    }
  },
  "common": {
    "loading": "Cargando...",
    "ok": "OK",
    "cancel": "Cancelar",
    "save": "Guardar",
    "error": "Error",
    "delete": "Eliminar",
    "copied": "Copiado.",
    "copyFailed": "No se pudo copiar.",
    "all": "Todos",
    "on": "Activado",
    "off": "Desactivado",
    "info": "Info",
    "me": "Yo",
    "remove": "Eliminar",
    "rename": "Renombrar",
    "success": "Éxito",
    "male": "Hombre",
    "female": "Mujer",
    "back": "Atrás",
    "continue": "Continuar",
    "create": "Crear",
    "join": "Unirse"
  },
  "settings": {
    "title": "Ajustes",
    "subtitle": "Familia, idioma y perfil",
    "setup": {
      "title": "Configurar tu cuenta",
      "step1": "1) Únete o crea una familia",
      "step2": "2) Luego establece tu nombre en Ajustes → Familia",
      "whyName": "Tu nombre se guarda como miembro de la familia y estará disponible tras unirte.",
      "next": "Siguiente paso",
      "setNameNow": "Establece tu nombre para que otros puedan reconocerte."
    },
    "language": "Idioma",
    "languageHint": "Elige el idioma de la interfaz.",
    "languageNote": "Este cambio se aplica a toda la app.",
    "croatian": "Croata",
    "english": "Inglés",
    "italian": "Italiano",
    "slovenian": "Esloveno",
    "french": "Francés",
    "german": "Alemán",
    "spanish": "Español",
    "serbian": "Serbio",
    "family": {
      "notInFamily": "No estás en una familia.",
      "statusLine": "Familia: {{name}} (Invitación: {{code}})",
      "title": "Familia",
      "notInFamilyTitle": "Sin familia"
    },
    "about": "Acerca de",
    "account": "Cuenta",
    "aboutLine": "Aplicación familiar para tareas y organización.",
    "version": "Versión",
    "family_not_in_family": "No estás en una familia.",
    "btn": {
      "changeLanguage": "Cambiar idioma ({{lang}})",
      "editName": "Editar nombre",
      "copy": "Copiar",
      "renameFamily": "Renombrar",
      "setName": "Establecer nombre",
      "leaveFamily": "Salir de la familia",
      "deleteFamily": "Eliminar familia",
      "showInviteCode": "Mostrar código",
      "hideInviteCode": "Ocultar código",
      "createFamily": "Crear familia",
      "joinFamily": "Unirse a la familia",
      "join": "Unirse"
    },
    "msg": {
      "familyRenamed": "Nombre de la familia actualizado."
    },
    "renameFamilyTitle": "Renombrar familia",
    "renameFamilyPlaceholder": "Nombre de la familia",
    "myName": "Mi nombre",
    "myNamePlaceholder": "Nombre",
    "nameRequired": "Introduce un nombre.",
    "saved": "Guardado.",
    "labels": {
      "family": "Familia",
      "inviteCode": "Código de invitación",
      "myName": "Tu nombre"
    },
    "notSet": "No establecido",
    "nameAfterJoin": "Únete o crea una familia para establecer tu nombre.",
    "deleteFamily": {
      "help": "Solo puedes eliminar la familia si eres el único miembro.",
      "title": "Eliminar familia",
      "body": "Esto eliminará permanentemente la familia y todos sus datos.",
      "confirm": "Escribe DELETE para confirmar.",
      "deleted": "Familia eliminada."
    },
    "joinFamily": {
      "help": "Introduce un código de invitación de un miembro de la familia.",
      "title": "Unirse a la familia",
      "placeholder": "Código de invitación",
      "invalidCode": "Introduce el código de invitación.",
      "joined": "Ahora estás en la familia."
    },
    "createFamily": {
      "title": "Crear familia",
      "desc": "Crea una nueva familia para empezar a compartir tareas.",
      "placeholder": "Nombre de la familia",
      "nameRequired": "El nombre de la familia es obligatorio.",
      "created": "Familia creada."
    },
    "leaveFamily": {
      "title": "Salir de la familia",
      "body": "¿Seguro que quieres salir de la familia?",
      "confirm": "Salir",
      "left": "Has salido de la familia."
    },
    "myProfile": "Mi perfil"
  },
  "tasks": {
    "status": {
      "open": "Abierta",
      "claimed": "Asignada",
      "review": "Para aprobar",
      "done": "Hecha"
    },
    "filter": {
      "all": "Todas",
      "active": "Activas",
      "review": "Para aprobar",
      "done": "Hechas"
    },
    "timelineHint": {
      "assigned": "Asignado → Hecho → Aprobado",
      "created": "Creado → Hecho → Aprobado"
    },
    "hideDoneOn": "Ocultar hechas: ON",
    "hideDoneOff": "Ocultar hechas: OFF",
    "emptyTitle": "Sin tareas",
    "emptySubtitle": "Crea la primera tarea con + Nueva",
    "actionsTitle": "Acciones de la tarea",
    "edit": "Editar",
    "editTitle": "Editar tarea",
    "newTitle": "Nueva tarea",
    "titlePlaceholder": "p. ej. Recoger a los niños",
    "timePlaceholder": "Escribe (HHMM) p. ej. 1630",
    "assignedTo": "Asignar a",
    "noAssignee": "Todos",
    "titleRequired": "El título es obligatorio.",
    "deleteConfirm": "¿Eliminar esta tarea?",
    "claim": "Tomar",
    "unclaim": "Soltar",
    "requestDone": "Pedir aprobación",
    "approve": "Aprobar",
    "reject": "Rechazar",
    "reset": "Restablecer",
    "calendar": "Calendario",
    "datePlaceholder": "Elige una fecha",
    "due": {
      "none": "Sin fecha límite"
    },
    "errors": {
      "actionFailed": "La acción falló.",
      "deleteFailed": "No se pudo eliminar.",
      "saveFailed": "No se pudo guardar."
    },
    "repeat": {
      "auto": "Auto",
      "autoHint": "Completar automáticamente sin aprobación",
      "autoOff": "Desactivado",
      "autoOn": "Activado",
      "days": "días",
      "none": "No repetir",
      "label": "Repetir"
    },
    "today": "Hoy",
    "tomorrow": "Mañana",
    "assignTo": "Asignar a",
    "assign": {
      "none": "No asignado",
      "select": "Seleccionar",
      "selectCta": "Seleccionar",
      "clear": "Borrar selección"
    },
    "title": "Tareas",
    "heroSub": "Filtros rápidos y vista general",
    "newBtn": "+ Nuevo",
    "new": {
      "title": "Crea una nueva tarea para un miembro de la familia",
      "placeholder": {
        "title": "p. ej. Lleva a Luka al entrenamiento",
        "time": "p. ej. 16:30"
      },
      "hint": {
        "timeOptional": "Opcional: establece una hora para activar recordatorios."
      },
      "repeatEveryDays": "Repetir cada",
      "assignTo": "¿Quién debe hacerlo?"
    },
    "newPrompt": "¿Qué puedes hacer hoy?",
    "when": "¿Cuándo?",
    "reminder": {
      "label": "Recordatorio",
      "requiresTime": "Establece una hora para activar recordatorios."
    },
    "needsApproval": "Para aprobar",
    "nextDue": "Próximo vencimiento",
    "action": {
      "claim": "Tomar",
      "unclaim": "Devolver",
      "requestDone": "Solicitar finalización",
      "approve": "Aprobar",
      "reject": "Rechazar",
      "doneAuto": "Hecho",
      "illDoIt": "Yo me encargo",
      "leave": "Salir",
      "markDone": "Marcar como hecho",
      "notDone": "No hecho",
      "accept": "Aceptar",
      "take": "Tomar"
    },
    "repeatEveryPlaceholder": "Repetir cada ___ días (solo números)",
    "repeatDaysPlaceholder": "___",
    "dateInvalid": "Elige una fecha válida.",
    "timeInvalid": "La hora debe ser HHMM (p. ej. 1630).",
    "calendarMissing": "Selector de calendario no instalado. Introduce DDMM; el calendario es opcional.",
    "active": "Activas",
    "done": "Hechas",
    "review": "Para aprobar",
    "selectedDate": "Fecha seleccionada",
    "dateNotSet": "—",
    "badge": {
      "open": "Abierto",
      "done": "Hecho"
    }
  },
  "today": {
    "title": "Hoy",
    "familyPrefix": "Familia",
    "pills": {
      "total": "Total",
      "open": "Activas",
      "done": "Hechas"
    },
    "anytime": "En cualquier momento",
    "morning": "Mañana",
    "afternoon": "Tarde",
    "evening": "Noche",
    "noTime": "Sin fecha",
    "empty": {
      "title": "No hay tareas hoy",
      "subtitle": "Añade tareas en Tareas y pon la fecha límite para hoy.",
      "active": "¡Todo hecho! 🎉",
      "done": "No hay tareas completadas hoy",
      "switch": "Cambia el filtro arriba o añade tareas en Tareas."
    }
  },
  "members": {
    "familyNameFallback": "Mi familia",
    "editHint": "Para editar a un miembro, toca ⋮ en su tarjeta.",
    "filter": {
      "all": "Todos",
      "kids": "Niños",
      "parents": "Padres"
    },
    "kids": "Niños",
    "listTitle": "Lista de miembros",
    "noMembers": "Aún no hay miembros.",
    "parents": "Padres",
    "stats": {
      "parents": "Padres",
      "kids": "Niños",
      "todayDone": "Hecho hoy",
      "done": "Hecho",
      "family": "Todas las tareas familiares"
    },
    "defaultParent": "Padre/Madre",
    "defaultChild": "Niño",
    "role": {
      "parent": "Padre/Madre",
      "child": "Niño",
      "mom": "Mamá",
      "dad": "Papá"
    },
    "doneToday": "Hecho hoy",
    "changeOwnNameHint": "Cambia tu nombre en Ajustes → Perfil.",
    "editMember": "Editar miembro",
    "hello": "Hola",
    "lastParentCantChangeRole": "No puedes cambiar el rol del último padre/madre. Añade primero otro padre/madre.",
    "lastParentCantRemove": "No puedes eliminar al último padre/madre. Añade primero otro padre/madre.",
    "lastParentNotice": "Es el último padre/madre, por lo que no puedes cambiar su rol ni eliminarlo.",
    "memberFallback": "Miembro",
    "newNamePlaceholder": "Nuevo nombre",
    "noFamilyBody": "Únete/crea una familia en Ajustes → Familia.",
    "noFamilyTitle": "Aún no estás en una familia.",
    "overview": "Aquí tienes un resumen de las actividades de tu familia.",
    "removeBody": "Las tareas permanecen, pero el miembro se elimina y se borran todas las asignaciones para él/ella.",
    "removeTitle": "¿Eliminar miembro?",
    "roleTitle": "Rol",
    "parent": "Padre/Madre",
    "child": "Niño",
    "editHintLongPress": "Consejo: mantén pulsado un miembro para editar."
  },
  "auth": {
    "tagline": "Tareas familiares, simplificadas",
    "title": "Iniciar sesión",
    "registerTitle": "Crear cuenta",
    "email": "Correo",
    "password": "Contraseña",
    "confirmPassword": "Confirmar contraseña",
    "togglePassword": "Mostrar u ocultar contraseña",
    "placeholders": {
      "email": "nombre@email.com",
      "password": "••••••••",
      "confirmPassword": "••••••••"
    },
    "passwordLoginBtn": "Entrar",
    "registerBtn": "Crear cuenta",
    "forgotPasswordBtn": "¿Olvidaste la contraseña?",
    "sendMagicLinkBtn": "Enviar magic link",
    "noAccount": "¿No tienes cuenta?",
    "createAccount": "Crear una",
    "haveAccount": "¿Ya tienes cuenta?",
    "backToLogin": "Iniciar sesión",
    "alerts": {
      "missingEmailPasswordBody": "Introduce correo y contraseña.",
      "missingEmailBody": "Introduce tu correo.",
      "missingRegisterBody": "Introduce correo y ambas contraseñas.",
      "weakPasswordBody": "La contraseña debe tener al menos 6 caracteres.",
      "passwordMismatchBody": "Las contraseñas no coinciden.",
      "loginErrorTitle": "Error de inicio de sesión",
      "resetSentBody": "Te enviamos un correo con un enlace para establecer una nueva contraseña.",
      "resetErrorTitle": "Error de restablecimiento",
      "magicLinkSentBody": "Hemos enviado un magic link a tu correo.",
      "magicLinkErrorTitle": "Error de magic link",
      "registerConfirmEmailBody": "Cuenta creada. Confirma tu correo con el enlace enviado y luego inicia sesión.",
      "registerOkBody": "Cuenta creada. Ya puedes iniciar sesión.",
      "registerErrorTitle": "Error de registro"
    },
    "missingUid": "No has iniciado sesión (falta el ID de miembro).",
    "invalidEmail": "Introduce un correo válido.",
    "magicLinkSent": "Revisa tu correo para el enlace de inicio de sesión.",
    "magicLinkHelp": "Te enviaremos un enlace de inicio de sesión por correo.",
    "loginMagicLink": "Inicio (magic link)",
    "sendLink": "Enviar enlace",
    "logout": "Cerrar sesión",
    "signedInAs": "Conectado como:"
  },
  "shopping": {
    "addBtn": "Añadir",
    "addPlaceholder": "Añadir un artículo…",
    "deleteBody": "¿Quieres quitar este artículo de la lista?",
    "deleteTitle": "Eliminar artículo",
    "emptyBody": "Añade artículos usando el campo de arriba.",
    "emptyTitle": "Nada que comprar",
    "errorTitle": "Compras",
    "me": "Yo",
    "member": "Miembro",
    "noFamilyBody": "Únete o crea una familia para usar la lista de compras compartida.",
    "noFamilyTitle": "Compras",
    "subtitle": "Lista compartida para toda la familia.",
    "suggestedBy": "Sugerido por",
    "toBuy": "Para comprar",
    "title": "Compras",
    "goShop": "Ir de compras",
    "sendTitle": "Enviar lista",
    "sendPick": "Elige quién va de compras.",
    "sendEmpty": "La lista está vacía.",
    "sendHeader": "¿Quién va de compras?",
    "sendHint": "Envía toda la lista como una sola notificación (sin spam).",
    "sentTitle": "Enviado",
    "sentBody": "Se envió la notificación de la lista de compras.",
    "addedAt": "Añadido",
    "addedBy": "Añadido por",
    "bought": "Comprado",
    "bought7d": "Comprado (7 días)",
    "boughtEmptyTitle": "Sin compras recientes",
    "boughtEmptyBody": "Los artículos que marques como comprados aparecerán aquí durante 7 días.",
    "boughtWhen": "Comprado",
    "chip": {
      "bread": "Pan",
      "cheese": "Queso",
      "detergent": "Detergente para ropa",
      "dishSoap": "Lavavajillas",
      "eggs": "Huevos",
      "fruit": "Fruta",
      "meat": "Carne",
      "milk": "Leche",
      "shampoo": "Champú",
      "toiletPaper": "Papel higiénico",
      "vegetables": "Verduras",
      "water": "Agua"
    }
  },
  "home": {
    "title": "Tareas diarias",
    "subtitle": "Vista rápida y enfoque",
    "plannerToday": "Planificador — hoy",
    "tasksLatest": "Tareas — más recientes",
    "shopping": "Compras",
    "shoppingCartCount": "Tienes {{count}} artículos en el carrito",
    "viewMore": "Ver más",
    "noFamilyShopping": "Únete o crea una familia para usar la lista de compras compartida.",
    "noTime": "En cualquier momento",
    "shoppingEmpty": "La lista de compras está vacía",
  },

  "planner": {
    "title": "Planificador",
    "subtitle": "Tu plan diario sencillo (privado o compartido).",
    "selectedDay": "Seleccionado",
    "hintPickDay": "Elige un día en el calendario y luego pulsa + Nuevo",
    "newBtn": "+ Nuevo",
    "newTitle": "Nuevo plan",
    "editTitle": "Editar plan",
    "placeholder": {
      "title": "p. ej. médico, pagar facturas, llamar a la abuela"
    },
    "timeLabel": "Hora (opcional)",
    "timePlaceholder": "HHMM (p. ej. 1630)",
    "anytime": "Cualquiera",
    "for": "Para",
    "shared": "Compartido",
    "forWho": "¿Para quién?",
    "family": "Familia",
    "someone": "Alguien",
    "assigned": {
      "all": "Familia",
      "some": "Seleccionado"
    },
    "someHint": "Consejo: selecciona uno o más miembros. (Pulsación larga para borrar)",
    "noFamilyHint": "Consejo: únete a una familia para compartir un plan con un miembro.",
    "noStorage": "Nota: AsyncStorage no está instalado, así que los planes se reiniciarán al recargar la app.",
    "calendarMissing": "El componente de calendario no está instalado. Si quieres vista mensual, instala react-native-calendars.",
    "emptyTitle": "Aún no hay planes",
    "emptyBody": "Pulsa + Nuevo y añade tu primer plan para este día.",
    "titleRequired": "El título es obligatorio.",
    "timeInvalid": "La hora debe ser HH:MM (p. ej. 1630).",
    "pickSomeone": "Elige al menos un miembro.",
    "deleteConfirm": "¿Eliminar este elemento?"
  }
};

const rs = {
  "home": {
    "title": "Dnevne obaveze",
    "subtitle": "Brz pregled i fokus",
    "plannerToday": "Planer — danas",
    "tasksLatest": "Zadaci — najnoviji",
    "shopping": "Kupovina",
    "shoppingCartCount": "Imaš {{count}} stavki u korpi",
    "viewMore": "Vidi više",
    "noFamilyShopping": "Pridruži se ili napravi porodicu da koristiš zajedničku listu kupovine.",
    "noTime": "Bilo kada",
    "shoppingEmpty": "Lista kupovine je prazna",
  },

  "tabs": {
    "home": "Danas",
    "members": "Članovi",
    "tasks": "Zadaci",
    "shopping": "Kupovina",
    "settings": "Podešavanja"
  },
  "onboarding": {
    "profile": {
      "title": "Podesi svoj profil",
      "subtitle": "Ovo pomaže porodici da prepozna ko je ko.",
      "name": "Tvoje ime",
      "role": "Ti si",
      "gender": "Pol",
      "male": "Muško",
      "female": "Žensko",
      "autoAvatar": "Avatar će se postaviti automatski"
    },
    "family": {
      "title": "Pridruži se ili kreiraj porodicu",
      "subtitle": "Možeš se pridružiti kodom ili kreirati novu porodicu.",
      "joinTitle": "Pridruži se postojećoj porodici",
      "joinSub": "Unesi porodični kod koji si dobio/la od roditelja.",
      "createTitle": "Kreiraj novu porodicu",
      "createSub": "Izaberi naziv porodice i kasnije pozovi ostale."
    }
  },
  "common": {
    "loading": "Učitavam...",
    "ok": "U redu",
    "cancel": "Odustani",
    "save": "Sačuvaj",
    "error": "Greška",
    "delete": "Obriši",
    "copied": "Kopirano.",
    "copyFailed": "Ne mogu da kopiram.",
    "all": "Sve",
    "on": "Uključeno",
    "off": "Isključeno",
    "info": "Info",
    "me": "Ja",
    "remove": "Ukloni",
    "rename": "Preimenuj",
    "success": "Uspeh",
    "male": "Muško",
    "female": "Žensko",
    "back": "Nazad",
    "continue": "Nastavi",
    "create": "Kreiraj",
    "join": "Pridruži se"
  },
  "settings": {
    "title": "Podešavanja",
    "subtitle": "Porodica, jezik i profil",
    "setup": {
      "title": "Podesi nalog",
      "step1": "1) Uđi u porodicu ili napravi novu",
      "step2": "2) Zatim postavi ime u Podešavanja → Porodica",
      "whyName": "Tvoje ime se čuva kao član porodice i biće dostupno nakon što uđeš u porodicu.",
      "next": "Sledeći korak",
      "setNameNow": "Postavi svoje ime da bi te drugi mogli prepoznati."
    },
    "language": "Jezik",
    "languageHint": "Izaberi jezik interfejsa.",
    "languageNote": "Ova promena važi za celu aplikaciju.",
    "croatian": "Hrvatski",
    "english": "Engleski",
    "italian": "Italijanski",
    "slovenian": "Slovenački",
    "french": "Francuski",
    "german": "Nemački",
    "spanish": "Španski",
    "serbian": "Srpski",
    "family": {
      "notInFamily": "Nisi u porodici.",
      "statusLine": "Porodica: {{name}} (Poziv: {{code}})",
      "title": "Porodica",
      "notInFamilyTitle": "Još nema porodice"
    },
    "about": "O aplikaciji",
    "account": "Nalog",
    "aboutLine": "Porodična aplikacija za zadatke i organizaciju.",
    "version": "Verzija",
    "family_not_in_family": "Nisi u porodici.",
    "btn": {
      "changeLanguage": "Promeni jezik ({{lang}})",
      "editName": "Uredi ime",
      "copy": "Kopiraj",
      "renameFamily": "Preimenuj",
      "setName": "Postavi ime",
      "leaveFamily": "Napusti porodicu",
      "deleteFamily": "Obriši porodicu",
      "showInviteCode": "Prikaži pozivni kod",
      "hideInviteCode": "Sakrij pozivni kod",
      "createFamily": "Napravi porodicu",
      "joinFamily": "Uđi u porodicu",
      "join": "Pridruži se"
    },
    "msg": {
      "familyRenamed": "Naziv porodice ažuriran."
    },
    "renameFamilyTitle": "Promeni naziv porodice",
    "renameFamilyPlaceholder": "Naziv porodice",
    "myName": "Moje ime",
    "myNamePlaceholder": "Ime",
    "nameRequired": "Unesi ime.",
    "saved": "Sačuvano.",
    "labels": {
      "family": "Porodica",
      "inviteCode": "Pozivni kod",
      "myName": "Tvoje ime"
    },
    "notSet": "Nije postavljeno",
    "nameAfterJoin": "Uđi ili napravi porodicu da postaviš ime.",
    "deleteFamily": {
      "help": "Porodicu možeš obrisati samo ako si jedini član.",
      "title": "Obriši porodicu",
      "body": "Ovo će trajno obrisati porodicu i sve podatke.",
      "confirm": "Upiši DELETE za potvrdu.",
      "deleted": "Porodica je obrisana."
    },
    "joinFamily": {
      "help": "Unesi pozivni kod od člana porodice.",
      "title": "Pridruži se porodici",
      "placeholder": "Pozivni kod",
      "invalidCode": "Unesi pozivni kod.",
      "joined": "Sada si u porodici."
    },
    "createFamily": {
      "title": "Kreiraj porodicu",
      "desc": "Kreiraj novu porodicu i počni da deliš zadatke.",
      "placeholder": "Naziv porodice",
      "nameRequired": "Naziv porodice je obavezan.",
      "created": "Porodica je kreirana."
    },
    "leaveFamily": {
      "title": "Napusti porodicu",
      "body": "Da li si siguran/na da želiš da napustiš porodicu?",
      "confirm": "Napusti",
      "left": "Napustio/la si porodicu."
    },
    "myProfile": "Moj profil"
  },
  "tasks": {
    "status": {
      "open": "Otvoren",
      "claimed": "Preuzet",
      "review": "Za potvrdu",
      "done": "Gotovo"
    },
    "filter": {
      "all": "Sve",
      "active": "Aktivno",
      "review": "Za potvrdu",
      "done": "Gotovo"
    },
    "timelineHint": {
      "assigned": "Dodeljeno → Gotovo → Odobreno",
      "created": "Kreirano → Gotovo → Odobreno"
    },
    "hideDoneOn": "Sakrij gotovo: UKLJ",
    "hideDoneOff": "Sakrij gotovo: ISKLJ",
    "emptyTitle": "Nema zadataka",
    "emptySubtitle": "Kreiraj prvi zadatak sa + Novi",
    "actionsTitle": "Radnje zadatka",
    "edit": "Uredi",
    "editTitle": "Uredi zadatak",
    "newTitle": "Novi zadatak",
    "titlePlaceholder": "npr. Pokupi decu",
    "timePlaceholder": "Unesi (HHMM) npr. 1630",
    "assignedTo": "Dodeli",
    "noAssignee": "Svi",
    "titleRequired": "Naslov je obavezan.",
    "deleteConfirm": "Obrisati ovaj zadatak?",
    "claim": "Preuzmi",
    "unclaim": "Vrati",
    "requestDone": "Traži potvrdu",
    "approve": "Odobri",
    "reject": "Odbij",
    "reset": "Resetuj",
    "calendar": "Kalendar",
    "datePlaceholder": "Izaberi datum",
    "due": {
      "none": "Bez roka"
    },
    "errors": {
      "actionFailed": "Radnja nije uspela.",
      "deleteFailed": "Brisanje nije uspelo.",
      "saveFailed": "Čuvanje nije uspelo."
    },
    "repeat": {
      "auto": "Auto",
      "autoHint": "Automatski završi bez potvrde",
      "autoOff": "Isključeno",
      "autoOn": "Uključeno",
      "days": "dana",
      "none": "Ne ponavljaj",
      "label": "Ponavljanje"
    },
    "today": "Danas",
    "tomorrow": "Sutra",
    "assignTo": "Dodeli",
    "assign": {
      "none": "Nije dodeljeno",
      "select": "Izaberi",
      "selectCta": "Izaberi",
      "clear": "Očisti izbor"
    },
    "title": "Zadaci",
    "heroSub": "Brzi filteri i pregled",
    "newBtn": "+ Novi",
    "new": {
      "title": "Kreiraj novi zadatak za člana porodice",
      "placeholder": {
        "title": "npr. Odvedi Luku na trening",
        "time": "npr. 16:30"
      },
      "hint": {
        "timeOptional": "Opcionalno: postavi vreme da uključiš podsetnike."
      },
      "repeatEveryDays": "Ponavljaj na svakih",
      "assignTo": "Ko to radi?"
    },
    "newPrompt": "Šta možeš danas da uradiš?",
    "when": "Kada?",
    "reminder": {
      "label": "Podsetnik",
      "requiresTime": "Postavi vreme da uključiš podsetnike."
    },
    "needsApproval": "Za potvrdu",
    "nextDue": "Sledeći rok",
    "action": {
      "claim": "Preuzmi",
      "unclaim": "Vrati",
      "requestDone": "Zahtevaj potvrdu",
      "approve": "Odobri",
      "reject": "Odbij",
      "doneAuto": "Urađeno",
      "illDoIt": "Ja ću",
      "leave": "Odustani",
      "markDone": "Označi gotovo",
      "notDone": "Nije gotovo",
      "accept": "Prihvati",
      "take": "Preuzmi"
    },
    "repeatEveryPlaceholder": "Ponavljaj na ___ dana (samo brojevi)",
    "repeatDaysPlaceholder": "___",
    "dateInvalid": "Izaberi ispravan datum.",
    "timeInvalid": "Vreme mora biti HHMM (npr. 1630).",
    "calendarMissing": "Izbor kalendara nije instaliran. Unesi DDMM; kalendar je opcion.",
    "active": "Aktivno",
    "done": "Gotovo",
    "review": "Za potvrdu",
    "selectedDate": "Izabrani datum",
    "dateNotSet": "—",
    "badge": {
      "open": "Otvoreno",
      "done": "Završeno"
    }
  },
  "today": {
    "title": "Danas",
    "familyPrefix": "Porodica",
    "pills": {
      "total": "Ukupno",
      "open": "Aktivno",
      "done": "Gotovo"
    },
    "anytime": "Bilo kada",
    "morning": "Jutro",
    "afternoon": "Popodne",
    "evening": "Veče",
    "noTime": "Bez roka",
    "empty": {
      "title": "Danas nema zadataka",
      "subtitle": "Dodaj zadatke u Zadaci i postavi rok za danas.",
      "active": "Sve je gotovo 🎉",
      "done": "Danas nema završenih zadataka",
      "switch": "Promeni filter gore ili dodaj nove zadatke u Zadaci."
    }
  },
  "members": {
    "familyNameFallback": "Moja porodica",
    "editHint": "Za uređivanje člana, dodirni ⋮ na njegovoj kartici.",
    "filter": {
      "all": "Sve",
      "kids": "Deca",
      "parents": "Roditelji"
    },
    "kids": "Deca",
    "listTitle": "Spisak članova",
    "noMembers": "Još nema članova.",
    "parents": "Roditelji",
    "stats": {
      "parents": "Roditelji",
      "kids": "Deca",
      "todayDone": "Danas urađeno",
      "done": "Gotovo",
      "family": "Svi porodični zadaci"
    },
    "defaultParent": "Roditelj",
    "defaultChild": "Dete",
    "role": {
      "parent": "Roditelj",
      "child": "Dete",
      "mom": "Mama",
      "dad": "Tata"
    },
    "doneToday": "Danas urađeno",
    "changeOwnNameHint": "Promeni svoje ime u Podešavanja → Profil.",
    "editMember": "Uredi člana",
    "hello": "Zdravo",
    "lastParentCantChangeRole": "Ne možeš promeniti ulogu poslednjeg roditelja. Prvo dodaj još jednog roditelja.",
    "lastParentCantRemove": "Ne možeš ukloniti poslednjeg roditelja. Prvo dodaj još jednog roditelja.",
    "lastParentNotice": "Ovo je poslednji roditelj, zato mu ne možeš promeniti ulogu niti ga ukloniti.",
    "memberFallback": "Član",
    "newNamePlaceholder": "Novo ime",
    "noFamilyBody": "Pridruži se/kreiraj porodicu u Podešavanja → Porodica.",
    "noFamilyTitle": "Još nisi u porodici.",
    "overview": "Evo pregleda porodičnih aktivnosti.",
    "removeBody": "Zadaci ostaju, ali član se uklanja i sve dodele njemu se brišu.",
    "removeTitle": "Ukloniti člana?",
    "roleTitle": "Uloga",
    "parent": "Roditelj",
    "child": "Dijete",
    "editHintLongPress": "Savjet: Drži pritisnuto člana za uređivanje."
  },
  "auth": {
    "tagline": "Porodični zadaci, jednostavno",
    "title": "Prijava",
    "registerTitle": "Napravi nalog",
    "email": "Email",
    "password": "Lozinka",
    "confirmPassword": "Potvrdi lozinku",
    "togglePassword": "Prikaži ili sakrij lozinku",
    "placeholders": {
      "email": "ime@email.com",
      "password": "••••••••",
      "confirmPassword": "••••••••"
    },
    "passwordLoginBtn": "Prijavi se",
    "registerBtn": "Napravi nalog",
    "forgotPasswordBtn": "Zaboravljena lozinka?",
    "sendMagicLinkBtn": "Pošalji magic link",
    "noAccount": "Nemaš nalog?",
    "createAccount": "Napravi ga",
    "haveAccount": "Već imaš nalog?",
    "backToLogin": "Prijava",
    "alerts": {
      "missingEmailPasswordBody": "Unesi email i lozinku.",
      "missingEmailBody": "Unesi svoj email.",
      "missingRegisterBody": "Unesi email i oba polja lozinke.",
      "weakPasswordBody": "Lozinka mora imati najmanje 6 karaktera.",
      "passwordMismatchBody": "Lozinke se ne poklapaju.",
      "loginErrorTitle": "Greška pri prijavi",
      "resetSentBody": "Poslali smo ti email sa linkom za novu lozinku.",
      "resetErrorTitle": "Greška pri resetovanju",
      "magicLinkSentBody": "Poslali smo magic link na tvoj email.",
      "magicLinkErrorTitle": "Greška magic linka",
      "registerConfirmEmailBody": "Nalog je napravljen. Potvrdi email preko linka, pa se prijavi.",
      "registerOkBody": "Nalog je napravljen. Sada se možeš prijaviti.",
      "registerErrorTitle": "Greška pri registraciji"
    },
    "missingUid": "Nisi prijavljen (nedostaje ID člana).",
    "invalidEmail": "Unesi ispravan email.",
    "magicLinkSent": "Proveri email za link za prijavu.",
    "magicLinkHelp": "Poslaćemo ti link za prijavu na email.",
    "loginMagicLink": "Prijava (magic link)",
    "sendLink": "Pošalji link",
    "logout": "Odjava",
    "signedInAs": "Prijavljen kao:"
  },
  "shopping": {
    "addBtn": "Dodaj",
    "addPlaceholder": "Dodaj stavku…",
    "deleteBody": "Da li želiš da ukloniš ovu stavku sa liste?",
    "deleteTitle": "Obriši stavku",
    "emptyBody": "Dodaj stavke koristeći polje iznad.",
    "emptyTitle": "Nema šta da se kupi",
    "errorTitle": "Kupovina",
    "me": "Ja",
    "member": "Član",
    "noFamilyBody": "Pridruži se ili napravi porodicu da koristiš zajedničku listu za kupovinu.",
    "noFamilyTitle": "Kupovina",
    "subtitle": "Zajednička lista za celu porodicu.",
    "suggestedBy": "Predložio",
    "toBuy": "Za kupiti",
    "title": "Kupovina",
    "goShop": "Idi u kupovinu",
    "sendTitle": "Pošalji listu",
    "sendPick": "Izaberi ko ide u kupovinu.",
    "sendEmpty": "Lista je prazna.",
    "sendHeader": "Ko ide u kupovinu?",
    "sendHint": "Pošalji celu listu kao jednu notifikaciju (bez spama).",
    "sentTitle": "Poslato",
    "sentBody": "Notifikacija sa listom za kupovinu je poslata.",
    "addedAt": "Dodato",
    "addedBy": "Dodao",
    "bought": "Kupljeno",
    "bought7d": "Kupljeno (7 dana)",
    "boughtEmptyTitle": "Nema skorijih kupovina",
    "boughtEmptyBody": "Stavke koje označiš kao kupljene biće ovde prikazane 7 dana.",
    "boughtWhen": "Kupljeno",
    "chip": {
      "bread": "Hleb",
      "cheese": "Sir",
      "detergent": "Deterdžent za veš",
      "dishSoap": "Deterdžent za sudove",
      "eggs": "Jaja",
      "fruit": "Voće",
      "meat": "Meso",
      "milk": "Mleko",
      "shampoo": "Šampon",
      "toiletPaper": "Toalet papir",
      "vegetables": "Povrće",
      "water": "Voda"
    }
  },
  "home": {
    "anytimeHint": "Bez roka",
    "scope": {
      "family": "Porodica",
      "kids": "Deca"
    },
    "stats": {
      "active": "Aktivno",
      "review": "Za odobrenje",
      "done": "Završeno"
    },
    "doneHint": "Nedavno završeno",
    "emptyTitle": "Nema zadataka",
    "reviewTitle": "Za odobrenje",
    "todayHint": "Fokus",
    "anytimeTitle": "Bilo kada",
    "filterPrefix": "Filter",
    "emptySubtitle": "Dodaj zadatke da počneš.",
    "doneTitle": "Završeno",
    "familyPrefix": "Porodica",
    "reviewHint": "Čeka tvoju odluku",
    "badge": {
      "attention": "PAŽ"
    },
    "reviewHintChild": "Čeka roditelja",
    "todayTitle": "Danas",
    "tagline": "Porodični zadaci, jednostavno",
    "upcomingHint": "Sledećih 7 dana",
    "upcomingTitle": "Nadolazeće",
    "subtitle": "Brzi pregled",
    "info": {
      "scope": {
        "title": "Opseg",
        "body": "Izaberi na koje zadatke želiš da se fokusiraš. Porodica prikazuje sve zadatke, a Deca samo dečje zadatke."
      },
      "review": {
        "title": "Potvrda",
        "body": {
          "parent": "Roditelj: potvrdi da je zadatak završen.",
          "child": "Dete: pošalji zadatak nazad na listu za izmene."
        }
      },
      "actions": {
        "title": "Akcije zadatka",
        "open": "Otvoren: zadatak je dostupan za preuzimanje.",
        "claimed": "Preuzet: neko radi na zadatku.",
        "review": {
          "parent": "Za odobrenje: roditelj treba da odobri ili odbije.",
          "child": "Za odobrenje: čeka roditelja."
        }
      }
    },
    "brandTitle": "FamiGo",
    "scopeHint": {
      "me": "Zadaci za tebe",
      "kids": "Zadaci za svu decu",
      "family": "Svi porodični zadaci"
    }
  }
,
  "planner": {
    "title": "Planer",
    "subtitle": "Tvoj jednostavan dnevni plan (privatno ili deljeno).",
    "selectedDay": "Izabrano",
    "hintPickDay": "Izaberi dan na kalendaru, zatim tapni + Novo",
    "newBtn": "+ Novo",
    "newTitle": "Novi plan",
    "editTitle": "Uredi plan",
    "placeholder": {
      "title": "npr. doktor, platiti račune, pozvati baku"
    },
    "timeLabel": "Vreme (opciono)",
    "timePlaceholder": "HHMM (npr. 1630)",
    "anytime": "Bilo kad",
    "for": "Za",
    "shared": "Deljeno",
    "forWho": "Za koga?",
    "family": "Porodica",
    "someone": "Neko",
    "assigned": {
      "all": "Porodica",
      "some": "Izabrano"
    },
    "someHint": "Savet: izaberi jednog ili više članova. (Dug pritisak briše)",
    "noFamilyHint": "Savet: pridruži se porodici da deliš plan sa članom.",
    "noStorage": "Napomena: AsyncStorage nije instaliran, pa će se planovi resetovati kada se aplikacija ponovo učita.",
    "calendarMissing": "Komponenta kalendara nije instalirana. Ako želiš mesečni prikaz, instaliraj react-native-calendars.",
    "emptyTitle": "Još nema planova",
    "emptyBody": "Tapni + Novo i dodaj prvi plan za ovaj dan.",
    "titleRequired": "Naslov je obavezan.",
    "timeInvalid": "Vreme mora biti HH:MM (npr. 1630).",
    "pickSomeone": "Izaberi bar jednog člana.",
    "deleteConfirm": "Obrisati ovu stavku?"
  }
};

export const i18n = new I18n({ en, hr, it, sl, fr, de, es, rs });
i18n.enableFallback = true;

i18n.defaultLocale = "en";
i18n.locale = "hr";

export async function getStoredLocale(): Promise<AppLocale | null> {
  try {
    const v = await AsyncStorage.getItem(LOCALE_KEY);
    if (!v) return null;
    if (v === "en" || v === "hr" || v === "it" || v === "sl" || v === "fr" || v === "de" || v === "es" || v === "rs") return v;
    return null;
  } catch {
    return null;
  }
}

export async function persistLocale(locale: AppLocale) {
  try { await AsyncStorage.setItem(LOCALE_KEY, locale); } catch {}
}

export function applyLocale(locale: AppLocale) { i18n.locale = locale; }
