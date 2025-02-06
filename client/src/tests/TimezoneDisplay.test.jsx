import { render, screen, waitFor, act, fireEvent, getByRole} from "@testing-library/react";
import Home from "../components/Home";
import { useAuth0 } from "@auth0/auth0-react";
import EventList from "../components/EventList";
import TimezoneDisplay from "../components/TimezoneDisplay";

jest.mock("@auth0/auth0-react");



describe("TimeZone displaye", () => {
    beforeEach(() => {
        const mockUser = {
            name: "John Doe",
            email: "johndoe@example.com",
            picture: "http://example.com/picture.jpg",
            sub: "auth0|123456",
            email_verified: true,
          };
        // Set up a mock return value for useAuth0
        useAuth0.mockReturnValue({
            accessToken: "fake-token",
            isAuthenticated: true,
            user: mockUser,
            logout: jest.fn(),
            loginWithRedirect: jest.fn(),
            getAccessTokenSilently: () => "fake-token"
        });

        // Set up the global fetch mock
        global.fetch = jest.fn((url, options) => {
            if (
                url === `${process.env.REACT_APP_API_URL}/api/user/timezones` &&
                options.method === "GET"
            ) {
                // Assuming GET request to fetch events
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([{"id":6,"name":"Africa/Algiers","userId":1}]),
                });
            }
            if (
                url === "https://worldtimeapi.org/api/timezone" &&
                options.method === "GET"
            ){
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([
                        "Africa/Abidjan",
                        "Africa/Algiers",
                        "Africa/Bissau",
                        "Africa/Cairo",
                        "Africa/Casablanca"])
                })
            }

            // Fallback for any other requests
            //return Promise.reject(new Error('Not found'));
        });
    });


    //Test display date
    it("displays data from db post auth", async () => {
        
        render(<TimezoneDisplay />)
        await waitFor(() => {
            const element = screen.getByTestId("timezone")
            expect(element)
        })
        expect(screen.getByTestId("timezone")).toHaveTextContent("Africa/Algiers")
    })

    it("displays dropdown with fetched data", async () => {
        
        render(<TimezoneDisplay />)
        await waitFor(() => {
            const element = screen.getByTestId("timezone")
            expect(element)
        })

        

        fireEvent.click(screen.getByRole("plus"))

   
        expect(screen.getByRole("timezone")).toHaveTextContent("Africa/Cairo")
    })
})