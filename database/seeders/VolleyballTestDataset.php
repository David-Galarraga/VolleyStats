<?php

namespace Database\Seeders;

use Carbon\Carbon;

/**
 * Synthetic roster data for local/testing environments. Only La Vencedora Azul
 * is sourced from the supplied good-faith list PDF.
 */
final class VolleyballTestDataset
{
    public static function teams(): array
    {
        $groups = [
            ['category' => 'A', 'gender' => 'femenino', 'teams' => [
                'La Vencedora Azul', 'Tigre', 'Pescadores', 'Racing', 'Progreso', 'Tranvía',
                'Cerro Porteño', 'Juventud', 'Olimpia', 'Black River', 'Axion',
            ]],
            ['category' => 'A', 'gender' => 'masculino', 'teams' => [
                'Club Vóley Los Aromos', 'Deportivo La Ribera', 'Asociación Vóley del Parque',
                'Estrella del Sur', 'Social y Deportivo El Ombú', 'Club Atlético La Estación',
                'Unión Vóley Gualeguaychú', 'Club Atlético Las Palmas',
            ]],
            ['category' => 'B', 'gender' => 'femenino', 'teams' => [
                'Club Vóley Las Acacias', 'Deportivo Costa del Uruguay', 'Club Social La Arboleda',
                'Vóley Las Moras', 'Unión Deportiva El Molino', 'Club Atlético Santa Rita',
                'Estrella de la Costanera', 'Las Flores Vóley',
            ]],
            ['category' => 'B', 'gender' => 'masculino', 'teams' => [
                'Club Vóley Los Ceibos', 'Deportivo Pueblo Nuevo', 'Club Atlético San Benito',
                'Social y Deportivo La Plaza', 'Vóley Paso del Tala', 'Unión Deportiva El Cardenal',
                'Club Atlético La Cañada', 'Club Vóley Los Tilos',
            ]],
            ['category' => 'C', 'gender' => 'femenino', 'teams' => [
                'Deportivo Las Camelias', 'Club Social El Jacarandá', 'Unión Vóley del Puerto',
                'Club Atlético La Querencia', 'Las Glicinas Vóley', 'Social y Deportivo El Ceibo',
                'Club Vóley Santa Elena', 'Deportivo La Esperanza',
            ]],
        ];

        $trainerFirstNames = ['Marcos', 'Esteban', 'Federico', 'Leandro', 'Pablo', 'Nicolás', 'Gustavo', 'Damián', 'Sergio', 'Andrés', 'Julián', 'Ramiro', 'Matías', 'Hernán'];
        $trainerSurnames = ['Almada', 'Barrera', 'Cabrera', 'Domínguez', 'Escobar', 'Falcón', 'Gaitán', 'Herrera', 'Ibarra', 'Juárez', 'Ledesma', 'Mansilla', 'Navarro', 'Ojeda', 'Pereyra', 'Quiroga', 'Roldán', 'Soria', 'Toledo', 'Urrutia', 'Varela', 'Wagner', 'Yáñez', 'Zárate', 'Arce', 'Benítez', 'Correa', 'Duarte', 'Ferreyra', 'Giménez', 'Luna', 'Medina', 'Paz', 'Romero', 'Suárez', 'Vega', 'Acosta', 'Bustamante', 'Farías', 'Godoy', 'Méndez', 'Peralta'];
        $delegateFirstNames = ['Cecilia', 'Gabriela', 'Lorena', 'Patricia', 'Verónica', 'Daniela', 'Silvia', 'Mariana', 'Claudia', 'Adriana', 'Mónica', 'Natalia', 'Carolina', 'Luciana'];
        $delegateSurnames = ['Aguirre', 'Barrios', 'Cardozo', 'Delgado', 'Espíndola', 'Franco', 'Galarza', 'Hidalgo', 'Iriarte', 'Jara', 'Klein', 'Leiva', 'Molina', 'Núñez', 'Ocampo', 'Ponce', 'Ramos', 'Salas', 'Tissera', 'Vidal', 'Acosta', 'Bustos', 'Cáceres', 'Díaz', 'Funes', 'Gómez', 'López', 'Márquez', 'Ortiz', 'Paredes', 'Rey', 'Sánchez', 'Tapia', 'Valdez', 'Zalazar', 'Alonso', 'Bravo', 'Castro', 'Dávalos', 'Luján', 'Montiel', 'Rivas', 'Sosa'];

        $rows = [];
        $trainerIndex = 0;
        $delegateIndex = 0;

        foreach ($groups as $group) {
            foreach ($group['teams'] as $teamName) {
                $isSourceTeam = $teamName === 'La Vencedora Azul';
                $trainerIndex++;
                $delegateIndex++;

                $rows[] = [
                    'name_team' => $teamName,
                    'city_team' => 'Gualeguaychú',
                    'category' => $group['category'],
                    'gender' => $group['gender'],
                    'trainer_name' => $isSourceTeam
                        ? 'OTERO, MARCOS'
                        : $trainerFirstNames[($trainerIndex - 2) % count($trainerFirstNames)].' '.$trainerSurnames[$trainerIndex - 2],
                    'trainer_dni' => $isSourceTeam
                        ? '34.660.647'
                        : null,
                    'trainer_birthdate' => $isSourceTeam
                        ? '1989-09-05'
                        : Carbon::parse('1970-01-01')->addDays(($trainerIndex - 2) * 113)->toDateString(),
                    'delegate_name' => $delegateFirstNames[($delegateIndex - 1) % count($delegateFirstNames)].' '.$delegateSurnames[$delegateIndex - 1],
                    'delegate_email' => 'delegado.'.str_pad((string) $delegateIndex, 3, '0', STR_PAD_LEFT).'@example.test',
                    'delegate_phone' => '000000'.str_pad((string) $delegateIndex, 4, '0', STR_PAD_LEFT),
                ];
            }
        }

        return $rows;
    }

    public static function fictionalPlayerName(string $gender, int $index): string
    {
        $femaleGivenNames = ['Abril', 'Agustina', 'Camila', 'Candela', 'Carolina', 'Catalina', 'Clara', 'Emilia'];
        $femaleSurnames = ['Almada', 'Barrera', 'Cabrera', 'Domínguez', 'Escobar', 'Falcón', 'Gaitán', 'Herrera', 'Ibarra', 'Juárez', 'Ledesma', 'Mansilla', 'Navarro', 'Ojeda', 'Pereyra', 'Quiroga', 'Roldán', 'Soria', 'Toledo', 'Urrutia', 'Varela', 'Yáñez', 'Zárate', 'Arce', 'Benítez', 'Correa'];
        $maleGivenNames = ['Benjamín', 'Bruno', 'Franco', 'Joaquín', 'Lautaro', 'Mateo', 'Nicolás', 'Tomás'];
        $maleSurnames = ['Aguirre', 'Barrios', 'Cardozo', 'Delgado', 'Espíndola', 'Franco', 'Galarza', 'Hidalgo', 'Iriarte', 'Jara', 'Leiva', 'Molina', 'Núñez', 'Ocampo', 'Ponce', 'Ramos'];

        $givenNames = $gender === 'femenino' ? $femaleGivenNames : $maleGivenNames;
        $surnames = $gender === 'femenino' ? $femaleSurnames : $maleSurnames;
        $teamIndex = intdiv($index, 8);
        $playerPosition = $index % 8;
        $surnameIndex = ($teamIndex + ($playerPosition * 3)) % count($surnames);

        return $givenNames[$playerPosition].' '.$surnames[$surnameIndex];
    }

    public static function fictionalPlayerBirthdate(string $gender, int $index): string
    {
        $start = $gender === 'femenino' ? '2002-01-01' : '2003-01-01';

        return Carbon::parse($start)->addDays($index * 5)->toDateString();
    }

    public static function sourcePlayers(): array
    {
        return [
            ['name_player' => 'MARTÍNEZ, CECILIA', 'birthdate_player' => '2000-08-24', 'dni_player' => '48.872.525'],
            ['name_player' => 'BUENA, KEILA NAZARENA', 'birthdate_player' => '2006-10-27', 'dni_player' => '47.528.462'],
            ['name_player' => 'ELGART, ERNESTINA', 'birthdate_player' => '2007-04-13', 'dni_player' => '47.924.864'],
            ['name_player' => 'DE PAOLA, AIMARA', 'birthdate_player' => '2006-07-01', 'dni_player' => '46.522.686'],
            ['name_player' => 'ORTELLADO, ELIZABETH CECILIA', 'birthdate_player' => '1998-07-24', 'dni_player' => '41.246.613'],
            ['name_player' => 'SALVA, ALMA LUCILA', 'birthdate_player' => '2009-05-30', 'dni_player' => '49.566.618'],
            ['name_player' => 'MENDOZA, VALENTINA', 'birthdate_player' => '1999-10-14', 'dni_player' => '42.212.086'],
            ['name_player' => 'PARADA, BRENDA', 'birthdate_player' => '2005-05-11', 'dni_player' => '46.520.800'],
            ['name_player' => 'OLIVER, LARA', 'birthdate_player' => '2010-04-23', 'dni_player' => '50.182.224'],
            ['name_player' => 'JAIMES, MELANIE', 'birthdate_player' => '2009-02-22', 'dni_player' => '49.330.506'],
            ['name_player' => 'DULCHE, GAUNA ABRIL', 'birthdate_player' => '2007-05-22', 'dni_player' => '47.926.980'],
            ['name_player' => 'COTTO, XIOMARA SOLEDAD', 'birthdate_player' => '1994-08-22', 'dni_player' => '37.564.970'],
        ];
    }
}
