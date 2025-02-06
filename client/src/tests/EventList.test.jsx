import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "../components/Home";
import { useAuth0 } from "@auth0/auth0-react";
import EventList from "../components/EventList";

jest.mock("@auth0/auth0-react");

describe("Home Component Tests", () => {
    beforeEach(() => {
        // Set up a mock return value for useAuth0
        useAuth0.mockReturnValue({
            accessToken: "fake-token",
            isAuthenticated: true,
            user: {},
            logout: jest.fn(),
            loginWithRedirect: jest.fn(),
        });

        // Set up the global fetch mock
        global.fetch = jest.fn((url, options) => {
            if (
                url === `${process.env.REACT_APP_API_URL}/api/events` &&
                options.method !== "POST"
            ) {

                // Assuming GET request to fetch events
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([
                        { id: 1, title: 'Book Movie Tickets', date: '2024-04-23T09:55:00.000Z', location: 'AMC Boston', description: 'Book tickets for 4' },
                        { id: 2, title: 'Weekend Trip to Rhode Island', date: '2024-04-27T04:00:00.000Z', location: 'Rhode Island', description: 'Trip to Rhode Island' },

                    ]),
                });
            }
            if (
                url === `${process.env.REACT_APP_API_URL}/api/events` &&
                options.method === "POST"
            ) {
                // Assuming POST request to add new event
                const newEvent = JSON.parse(options.body);
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ id: 3, ...newEvent }),
                });
            }
            // Fallback for any other requests
            return Promise.reject(new Error('Not found'));
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test("Event list renders correctly with events data", async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByText("Book Movie Tickets")).toBeInTheDocument();
            expect(screen.getByText("Weekend Trip to Rhode Island")).toBeInTheDocument();
        });

    });
    test("renders without crashing", () => {
        render(<Home />);
        expect(screen.getByText("Welcome To Your Personal App")).toBeInTheDocument();
      });
});
