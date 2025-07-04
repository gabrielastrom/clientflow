import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import type { TeamMember } from '@/lib/types';
import type { User } from 'firebase/auth';

export async function getTeamMembers(): Promise<TeamMember[]> {
    try {
        const teamCol = collection(db, 'team');
        const teamSnapshot = await getDocs(teamCol);
        if (teamSnapshot.empty) {
            console.log('No team members found in Firestore.');
            return [];
        }
        const teamList = teamSnapshot.docs.map(doc => doc.data() as TeamMember);
        return teamList;
    } catch (error) {
        console.error("Error fetching team members: ", error);
        throw new Error("Could not fetch team members.");
    }
}

export async function upsertTeamMemberFromUser(user: User): Promise<void> {
    try {
        const teamMemberRef = doc(db, "team", user.uid);
        const docSnap = await getDoc(teamMemberRef);

        if (!docSnap.exists()) {
            const newTeamMember: TeamMember = {
                id: user.uid,
                name: user.displayName || user.email?.split('@')[0] || 'New User',
                email: user.email || '',
                phone: user.phoneNumber || '',
                role: 'Designer', // Default role
                assignedClients: [],
                hourlyRate: 150, // Default hourly rate
            };
            await setDoc(teamMemberRef, newTeamMember);
        }
    } catch (error) {
        console.error("Error upserting team member: ", error);
        throw new Error("Failed to upsert team member.");
    }
}


export async function updateTeamMember(teamMember: TeamMember): Promise<void> {
    try {
        const teamMemberRef = doc(db, "team", teamMember.id);
        await setDoc(teamMemberRef, teamMember, { merge: true });
    } catch (error) {
        console.error("Error updating team member: ", error);
        throw new Error("Failed to update team member.");
    }
}

export async function deleteTeamMember(teamMemberId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "team", teamMemberId));
    } catch (error) {
        console.error("Error deleting team member: ", error);
        throw new Error("Failed to delete team member.");
    }
}
