import { Link } from "react-router-dom"

function LogoContainer() {
    return (
        <Link to={"/"}>
            <img src="/logo.png" alt="logo"
                className="max-w-10 max-h-10 object-contain"
            />
        </Link>
    )
}

export default LogoContainer
