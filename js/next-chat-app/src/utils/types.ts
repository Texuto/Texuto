export interface Message {
	content: string;
	author: string;
	id: string;
	isAdmin: boolean;
	date: string
}

export type PickWhereValuesAre<T, V> = {
	[Key in keyof T as T[Key] extends V ? Key : never]: T[Key];
};
