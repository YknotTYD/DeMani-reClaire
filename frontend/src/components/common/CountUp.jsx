import { useCountUp } from '../../hooks/useCountUp'

/** Nombre entier qui monte jusqu'à sa valeur à l'affichage. */
export default function CountUp({ value }) {
  return useCountUp(value)
}
