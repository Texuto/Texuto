import { startTransition, useEffect, useRef, useState } from "react";
import { useChannelMessage, useReadChannelState } from "@onehop/react";
import { getErrorMessage } from "../utils/errors";
import { ChannelName, ChangeChannel } from "./api/channel";
import { Message, PickWhereValuesAre } from "../utils/types";

// checks current hop channel
export function ChangeActiveChannel(channel:number){		
	switch(channel){
		case 1:
			ChangeChannel("General")						
			break;
		case 2:
			ChangeChannel("Selfies")						
			break;
		case 3:
			ChangeChannel("Anime")								
			break;
		case 4:
			ChangeChannel("Music")									
			break;
		case 5:
			ChangeChannel("Lounge")								
			break;
		default:
			ChangeChannel("General")								
	}
	let TitleContainer = document.getElementById("Title") as HTMLInputElement;
	TitleContainer.value = "Texuto | " + ChannelName;
}

export default function Index() {
	const [loading, setLoading] = useState(false);
	const [General, setGeneral] = useState<Array<Message>>([]);
	const [ text, setText ] = useState('')
	const [message, setMessage] = useState<Omit<Message, "id" | "isAdmin">>({
		author: "",
		content: "",
		date:"",
	});

	const inputRef = useRef<HTMLInputElement | null>(null);

	useChannelMessage<Message>(ChannelName, "MESSAGE_CREATE", message => {
		setGeneral(General => [message, ...General]);
	});

	const { state } = useReadChannelState<{ General: Message[] }>(ChannelName);

	useEffect(() => {
		if (General.length === 0 && state && state.General.length > 0) {
			setGeneral(state.General);
		}
	}, [state, General]);

	useEffect(() => {
		if (!loading) {
			inputRef.current?.focus();
		}	
	}, [loading]);

	const set = (key: keyof PickWhereValuesAre<Omit<Message, "id">, string>) => {
		return (event: React.ChangeEvent<HTMLInputElement>) => {
			setMessage(m => ({ ...m, [key]: event.target.value }));
		};
	};

	return (
		<div>		
			<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossOrigin="anonymous"></link>	
			<script src="https://kit.fontawesome.com/9fc393ed11.js" crossOrigin="anonymous"></script>

			<title id="Title">Texuto</title>		
			<link rel="icon" href="./favicon.ico" type="image/x-icon"></link>
			<nav className="navbar navbar-dark bg-dark">
				<a className="navbar-brand" href="#">Texuto</a>
				<li className="nav-item">
					<a className="nav-link" href="#">Help</a>
				</li>
			</nav>				
			<nav className="discordnav"> 		
				<a href="#" className="active">
				<img alt="logo" src="favicon.ico" width="50" height="50" />
				</a><hr/>				
				<div className="discordnavlink"  title="Github" >
					<a href="https://github.com/Texuto/Texuto" className="active">
						<img src="https://cdn-icons-png.flaticon.com/512/1051/1051377.png?w=360" width="50" height="50" />
					</a>
				</div>				
			</nav>		
			<form
				onSubmit={async e => {
					e.preventDefault();

					if (message.content.trim() === "") {
						return;
					}

					setLoading(true);

					try {
						const request = new Request("/api/message", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(message),
						});

						const response = await fetch(request);
						const body = (await response.json()) as
							| { success: true }
							| { success: false; message: string };

						if (!body.success) {
							throw new Error(body.message);
						}

						setMessage(old => ({ ...old, content: "" }));
					} catch (e: unknown) {
						console.error(e);
						alert(getErrorMessage(e));
					} finally {
						startTransition(() => {
							setLoading(false);
						});
					}
				}}>			
					<input
						className="User"
						disabled={loading}
						type="text"
						placeholder="Username"
						value={message.author}
						onChange={set("author")}
					/>

					<input
						className="InpField"
						ref={inputRef}
						disabled={loading}
						type="text"
						placeholder="Write a message..."
						value={message.content}
						onChange={set("content")}

					/>
					

					<button disabled={loading} type="submit" className="sendbutton">Send</button>				
			</form>
			
				{General.map(message => (
					<div className="msg-container">
						<div className="message-blue">
							<li key={message.id} className="UniqueList">
								<b style={{ color: message.isAdmin ? "gold" : "black" }}>{message.author}</b><br/>{" "}
								<span>{message.content}</span>
								<div className="message-timestamp-left">{message.date}</div>
							</li>
						</div>
					</div>
				))}				
		</div>
	);
}
