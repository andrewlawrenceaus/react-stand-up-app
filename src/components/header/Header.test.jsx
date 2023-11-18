import { render, screen } from "@testing-library/react";
import Header from "./Header";
import { BrowserRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";

it("renders app title in header", () => {
    act(() => {
        render(<BrowserRouter><Header /></BrowserRouter>);
    })

    const element = screen.getByText('Stand-Up')
    expect(element).toBeInTheDocument()
})