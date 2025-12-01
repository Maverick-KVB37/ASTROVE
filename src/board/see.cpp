#include "see.h"
#include "../core/attacks.h"
#include <algorithm>
namespace ASTROVE{

Bitboard SEE::get_all_attackers(const Position& pos,Square sq,Bitboard occupied){
    //for sliding piece
    Bitboard bishopattacks=Attacks::get_bishop_attacks(sq,occupied);
    Bitboard rookattacks=Attacks::get_rook_attacks(sq,occupied);

    Bitboard bishops=pos.pieces(White,Bishop) | pos.pieces(Black,Bishop);
    Bitboard rooks=pos.pieces(White,Rook) | pos.pieces(Black,Rook);
    Bitboard queens =pos.pieces(White,Queen) | pos.pieces(Black,Queen);

    Bitboard sliders=(bishopattacks & (bishops | queens))
                    | (rookattacks & (rooks | queens));

    //now for non sliding pieces

    Bitboard knights=(pos.pieces(White,Pawn) | pos.pieces(Black,Pawn)) & Attacks::get_knight_attacks(sq);
    Bitboard kings=(pos.pieces(White,King)|pos.pieces(Black,King)) & Attacks::get_king_attacks(sq);

    //pawns
    Bitboard wpawns=pos.pieces(White,Pawn) & Attacks::get_pawn_attacks(Black,sq);
    Bitboard bpawns=pos.pieces(Black,Pawn) & Attacks::get_pawn_attacks(White,sq);

    return sliders|knights|kings|wpawns|bpawns;
}

//finding lesat valuable pieces
Bitboard SEE::get_least_valuable_piece(const Position& pos,Bitboard attadef,Color color,PieceType& pieceType){
    Bitboard pawns=attadef&pos.pieces(color,Pawn);
    if(pawns){
        pieceType=Pawn;
        return pawns & -pawns;
    }

    Bitboard knights=attadef&pos.pieces(color,Knight);
    if(knights){
        pieceType=Knight;
        return  knights& -knights;
    }

    Bitboard bishops=attadef&pos.pieces(color,Bishop);
    if(bishops){
        pieceType=Bishop;
        return  bishops& -bishops;
    }

    Bitboard rooks=attadef&pos.pieces(color,Rook);
    if(rooks){
        pieceType=Rook;
        return  rooks& -rooks;
    }

    Bitboard queens=attadef&pos.pieces(color,Queen);
    if(queens){
        pieceType=Queen;
        return queens& -queens;
    }

    Bitboard king=attadef&pos.pieces(color,King);
    if(king){
        pieceType=King;
        return  king& -king;
    }

    return 0ULL;
}

// Static Exchange Evaluation for a move.
int SEE::calculate(const Position& pos, Move move) {
    Square from=move.from();
    Square to=move.to();

    PieceType target = piecetype(pos.pieceAt(to));
    PieceType attacker = piecetype(pos.pieceAt(from));
    Color side = ~pos.sideToMove();

    int gain[64] = {0};
    int depth = 0;

    gain[0] = VALUES[target];

    Bitboard occupied =pos.occupancy();
    Bitboard attackerBB=(1ULL<<from);
    Bitboard attackers=get_all_attackers(pos,to,occupied);


    while (attackerBB) {
        depth++;

        if (depth >= 64) {
            break;
        }

        gain[depth] = VALUES[attacker] - gain[depth - 1];
        if (std::max(-gain[depth - 1], gain[depth]) < 0)
            break;

        attackers&= ~attackerBB;
        occupied &= ~attackerBB;
        
        Bitboard newXrays = (Attacks::get_bishop_attacks(to, occupied) & (pos.bishops<White>() | pos.bishops<Black>() | pos.queens<White>() | pos.queens<Black>()))
                          | (Attacks::get_rook_attacks(to, occupied)   & (pos.rooks<White>() | pos.rooks<Black>() | pos.queens<White>() | pos.queens<Black>()));
        
        attackers |=(newXrays & occupied); 
        //now finding next attacckers
        attackerBB = get_least_valuable_piece(pos,attackers,side,attacker);
    }

    //now back propagate
    while(--depth){
        gain[depth-1] = -std::max(-gain[depth-1],gain[depth]);
    }

    return gain[0];
}

bool SEE::isgood(const Position& pos,Move move,int threshold){
    //for enpasant and promotion
    if(move.is_enpassant() || move.is_promotion()){
        return calculate(pos,move)>=threshold;
    }

    PieceType target = piecetype(pos.pieceAt(move.to()));
    if(target==Nonetype){
        return threshold<=0;
    }

    return calculate(pos,move)>=threshold;
}
}