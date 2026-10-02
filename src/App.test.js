import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";
import { GymProvider } from "./context/GymContext.jsx";

const renderApp = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <GymProvider>
        <App />
      </GymProvider>
    </MemoryRouter>
  );

beforeEach(() => window.localStorage.clear());

test("dashboard shows an empty state", () => {
  renderApp();
  expect(screen.getByText(/no workouts yet/i)).toBeInTheDocument();
});

test("exercise library lists exercises and filters by muscle", () => {
  renderApp("/exercises");
  expect(screen.getByText("Bench Press")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Legs" }));
  expect(screen.queryByText("Bench Press")).not.toBeInTheDocument();
  expect(screen.getByText("Squat")).toBeInTheDocument();
});

test("can log a workout and see it in the list and details", () => {
  renderApp("/workouts");
  fireEvent.click(screen.getByRole("button", { name: /new workout/i }));
  fireEvent.change(screen.getByPlaceholderText("Push Day"), { target: { value: "Push Day" } });
  fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: "65" } });
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
  fireEvent.change(screen.getByLabelText(/set 1 weight/i), { target: { value: "60" } });
  fireEvent.change(screen.getByLabelText(/set 1 reps/i), { target: { value: "10" } });
  fireEvent.click(screen.getByRole("button", { name: /save workout/i }));

  const card = screen.getByRole("link", { name: /push day/i });
  expect(within(card).getByText("600 kg")).toBeInTheDocument();
  fireEvent.click(card);
  expect(screen.getByRole("heading", { name: "Push Day" })).toBeInTheDocument();
  expect(screen.getByText("60 kg")).toBeInTheDocument();
});

test("profile saves and validates", () => {
  renderApp("/profile");
  fireEvent.click(screen.getByRole("button", { name: /save profile/i }));
  expect(screen.getByText(/enter your name/i)).toBeInTheDocument();
});
