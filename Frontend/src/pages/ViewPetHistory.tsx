import { useQuery } from "@tanstack/react-query";
import { Table } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import PageTitle from "../components/PageTitle";
import type { PetReportType } from "../types";
import petApi from '../api/petAPI'
import { format, parseISO } from "date-fns";


export function ViewPetReport() {
    const userId = Number(sessionStorage.getItem('userId'))
    const { getAccessTokenSilently, isAuthenticated, isLoading  } = useAuth0()
    const nullPetsList: PetReportType[]= []
    const DISPLAY_FORMAT = `MM/dd/yyyy`

    const { data: petsList = nullPetsList, isSuccess } = useQuery<PetReportType[]>({
        queryKey: [ 'petReport' ],
        enabled: isAuthenticated,
        queryFn: async () => {
            const token = await getAccessTokenSilently()
            return petApi.getPetsReport(userId, token)
        }
    })

    function handleDateUpdate(date: string) {
        const dateOnly = date.split(' ')[0]
        const parsed = parseISO(dateOnly)
        return format(parsed, DISPLAY_FORMAT)
    }
    return (
        <>
            { isLoading && <PageTitle title={`Loading pet...`}/> }
            <PageTitle title='Interactions Report'/>
            {
                !isSuccess && <h1 className='error'>Something Went Wrong When Loading Report :(</h1>
            }
            {
                petsList.length > 0 ?
                <Table striped bordered hover className='w-75'>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Breed</th>
                            <th>Action</th>
                            <th>When</th>
                        </tr>
                    </thead>
                    <tbody>
                        {petsList.map((pet, index) => (
                            <tr key={String(index)}>
                                <td>{pet.Name}</td>
                                <td>{pet.breed.Type}</td>
                                <td>{pet.action.Type}</td>
                                <td>{handleDateUpdate(String(pet.When))}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                :
                <h1>No actions to report</h1>
            }
        </>
    )
}