#include "ordering.h"
#include "../core/attacks.h"
#include "../board/see.h"
#include <cstring>
#include <algorithm>

MoveOrderer::MoveOrderer(){
    for(int attacker=Pawn;attacker<=King;++attacker){
        for(int victim=Pawn;victim<=King;++victim){
            mvv_lva[attacker][victim]=SEEVALUE[victim]+6-(SEEVALUE[attacker]/100);
        }
    }
}

void MoveOrderer::scoreMoves(const Position& pos, MoveList& moves, Move ttMove, Move killers[2],const int history[2][64][64],Move prevMove,const Move counterMoves[2][64][64]) {

    scores.clear();
    scores.resize(moves.size());
    
    //find counter move
    Move counterMove=NO_MOVE;
    if(prevMove!=NO_MOVE){
        counterMove=counterMoves[pos.sideToMove()][prevMove.from()][prevMove.to()];
    }

    for (size_t i = 0; i < moves.size(); i++) {

        const Move& move = moves[i];
        
        //TT move
        if(move==ttMove){
            scores[i]=SCORE_TT_MOVE;
        }
        
        //Captures
        else if(move.is_capture()){
            PieceType attacker = piecetype(pos.pieceAt(move.from()));
            PieceType victim = piecetype(pos.pieceAt(move.to()));

            //enpassant
            if(move.is_enpassant()){
                victim=Pawn;
            }
            //base core
            int score=SCORE_CAPTURE_BASE+mvv_lva[attacker][victim];
            if(ASTROVE::SEE::isgood(pos,move,0)){
                score+=10000;
            }
            else {
                score-5000+mvv_lva[attacker][victim];
            }
            scores[i]=score;
        }

        //killer movews
        else if(move==killers[0]){
            scores[i]=SCORE_KILLER_1;
        }
        else if(move==killers[1]){
            scores[i]=SCORE_KILLER_2;
        }

        else if(move==counterMove){
            scores[i]=17000;
        }

        //now histroy heuristics
        else {
            int hscore=history[pos.sideToMove()][move.from()][move.to()];
            //just ensuring that hscore can not exceed killer moves
            if(hscore>16000) hscore=16000;
            scores[i]=hscore;
        }
    }
    
    for (size_t i = 0; i < moves.size(); ++i) {  // Add safety limit
        size_t bestIdx = i;
        for (size_t j = i + 1; j < moves.size(); ++j) {  // Add safety limit
            if (scores[j] > scores[bestIdx]) {
                bestIdx = j;
            }
        }
        if (bestIdx != i) {
            std::swap(moves[i], moves[bestIdx]);
            std::swap(scores[i], scores[bestIdx]);
        }
    }
}

void MoveOrderer::scoreCaptures(const Position& pos, MoveList& captures) {
    scores.clear();
    scores.resize(captures.size());
    
    for (size_t i = 0; i < captures.size(); i++) {
        scores[i] = ASTROVE::SEE::calculate(pos,captures[i]);
    }
    
    // sort captures by SEE value
    for (size_t i = 0; i < captures.size(); ++i) {
        size_t bestIdx=i;
        for (size_t j = i + 1; j < captures.size(); ++j) {
            if (scores[j] > scores[bestIdx]) {
                bestIdx=j;
            }
        }
        if(bestIdx!=i){
            std::swap(captures[i], captures[bestIdx]);
            std::swap(scores[i], scores[bestIdx]);
        }
    }
}

